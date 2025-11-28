import os
# Force Transformers to use PyTorch-only to avoid importing TensorFlow/Flax paths
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")
os.environ.setdefault("TRANSFORMERS_NO_FLAX", "1")
os.environ.setdefault("USE_TF", "0")

from ..config.settings import settings
from functools import lru_cache
from ..utils.logger import get_logger
import sys
import subprocess
import threading
import time

logger = get_logger(__name__)


@lru_cache
def get_model():
    try:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading SentenceTransformer model: {settings.MODEL_NAME}")
        model = SentenceTransformer(settings.MODEL_NAME)
        logger.info(f"Model loaded successfully: {settings.MODEL_NAME}")
        return model
    except Exception as e:
        # If sentence-transformers isn't installed in the image, try to install it at runtime.
        logger.warning(f"Embedding model import failed: {e}. Attempting runtime install of dependencies.")
        try:
            # Install CPU-only torch first (from the official CPU index) to avoid pulling CUDA
            # artifacts. Then install sentence-transformers. This reduces unexpected large CUDA
            # dependency downloads on machines without GPUs.
            # Pin a compatible huggingface_hub first to avoid API mismatches
            install_cmds = [
                [sys.executable, "-m", "pip", "install", "--no-cache-dir", "--prefer-binary", "torch", "--index-url", "https://download.pytorch.org/whl/cpu"],
                [sys.executable, "-m", "pip", "install", "--no-cache-dir", "huggingface-hub==0.13.4"],
                [sys.executable, "-m", "pip", "install", "--no-cache-dir", "--prefer-binary", "sentence-transformers==2.2.2"],
            ]
            for cmd in install_cmds:
                logger.info(f"Running install command: {' '.join(cmd)}")
                subprocess.check_call(cmd)
            # Short sleep to allow pip to settle files on disk inside container
            time.sleep(1)
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer model after runtime install: {settings.MODEL_NAME}")
            model = SentenceTransformer(settings.MODEL_NAME)
            logger.info(f"Model loaded successfully after runtime install: {settings.MODEL_NAME}")
            return model
        except Exception as e2:
            logger.error(f"Runtime installation or model load failed: {e2}", exc_info=True)
            return None


def embed_text(text: str) -> list[float]:
    model = get_model()
    if not model:
        logger.warning(f"embed_text called but model is None, returning empty list")
        return []
    try:
        emb = model.encode(text or "", convert_to_numpy=True)
        logger.debug(f"Generated embedding with shape: {emb.shape}")
        return emb.tolist()
    except Exception as e:
        logger.error(f"Failed to embed text: {e}", exc_info=True)
        return []
