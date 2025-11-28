from typing import Tuple
from fastapi import UploadFile
from PyPDF2 import PdfReader
from docx import Document


async def extract_text(file: UploadFile) -> Tuple[str, str]:
    """Extract text from uploaded file. Returns (filename, text)."""
    filename = file.filename or "resume"
    content_type = file.content_type or "application/octet-stream"
    suffix = (filename.split(".")[-1] or "").lower()
    data = await file.read()

    if suffix == "pdf" or content_type == "application/pdf":
        from io import BytesIO
        reader = PdfReader(BytesIO(data))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    elif suffix in ("docx",) or content_type in ("application/vnd.openxmlformats-officedocument.wordprocessingml.document",):
        from io import BytesIO
        doc = Document(BytesIO(data))
        text = "\n".join(p.text for p in doc.paragraphs)
    else:
        # Assume plain text
        try:
            text = data.decode("utf-8", errors="ignore")
        except Exception:
            text = ""

    return filename, text
