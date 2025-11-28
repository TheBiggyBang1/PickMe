"""
Fine-tune Sentence-BERT model for resume-job matching (Phase 2).

This script allows fine-tuning the pre-trained Sentence-BERT model
on domain-specific resume-job pairs to improve matching accuracy.
"""

import os
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Tuple
import json

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from sentence_transformers import SentenceTransformer, InputExample, losses, evaluation
from sentence_transformers.evaluation import EmbeddingSimilarityEvaluator
from torch.utils.data import DataLoader
import torch


def load_training_data(data_path: str) -> List[InputExample]:
    """
    Load training data from JSON file.
    
    Expected format:
    [
        {"resume": "text...", "job": "text...", "score": 0.8},
        ...
    ]
    """
    examples = []
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for item in data:
        examples.append(InputExample(
            texts=[item['resume'], item['job']],
            label=float(item['score'])
        ))
    
    print(f"Loaded {len(examples)} training examples")
    return examples


def train_model(
    model_name: str = "multi-qa-MiniLM-L6-cos-v1",
    train_data_path: str = "data/training_pairs.json",
    output_path: str = "models/trained_models/fine_tuned_matcher",
    epochs: int = 4,
    batch_size: int = 16,
    warmup_steps: int = 100,
):
    """
    Fine-tune Sentence-BERT model on resume-job pairs.
    
    Args:
        model_name: Base model to fine-tune
        train_data_path: Path to training data JSON
        output_path: Where to save fine-tuned model
        epochs: Number of training epochs
        batch_size: Training batch size
        warmup_steps: Warmup steps for learning rate scheduler
    """
    print(f"Loading base model: {model_name}")
    model = SentenceTransformer(model_name)
    
    print(f"Loading training data from: {train_data_path}")
    train_examples = load_training_data(train_data_path)
    
    # Create DataLoader
    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=batch_size)
    
    # Use CosineSimilarityLoss for sentence pair scoring
    train_loss = losses.CosineSimilarityLoss(model)
    
    print(f"Starting training for {epochs} epochs...")
    print(f"Batch size: {batch_size}, Warmup steps: {warmup_steps}")
    
    # Train the model
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=epochs,
        warmup_steps=warmup_steps,
        output_path=output_path,
        show_progress_bar=True,
    )
    
    print(f"Model saved to: {output_path}")
    
    # Save metadata
    metadata = {
        "base_model": model_name,
        "training_date": datetime.utcnow().isoformat(),
        "epochs": epochs,
        "batch_size": batch_size,
        "training_samples": len(train_examples),
    }
    
    metadata_path = Path(output_path) / "training_metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"Training metadata saved to: {metadata_path}")
    return model


def evaluate_model(model_path: str, test_data_path: str) -> float:
    """
    Evaluate fine-tuned model on test set.
    
    Args:
        model_path: Path to fine-tuned model
        test_data_path: Path to test data JSON
    
    Returns:
        Spearman correlation score
    """
    print(f"Loading model from: {model_path}")
    model = SentenceTransformer(model_path)
    
    print(f"Loading test data from: {test_data_path}")
    test_examples = load_training_data(test_data_path)
    
    # Extract sentences and scores
    sentences1 = [ex.texts[0] for ex in test_examples]
    sentences2 = [ex.texts[1] for ex in test_examples]
    scores = [ex.label for ex in test_examples]
    
    evaluator = EmbeddingSimilarityEvaluator(sentences1, sentences2, scores)
    
    print("Evaluating model...")
    correlation = evaluator(model)
    
    print(f"Spearman Correlation: {correlation:.4f}")
    return correlation


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Fine-tune Sentence-BERT for resume-job matching")
    parser.add_argument("--train-data", default="data/training_pairs.json", help="Training data path")
    parser.add_argument("--test-data", default="data/test_pairs.json", help="Test data path")
    parser.add_argument("--output", default="models/trained_models/fine_tuned_matcher", help="Output model path")
    parser.add_argument("--epochs", type=int, default=4, help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--eval-only", action="store_true", help="Only evaluate existing model")
    
    args = parser.parse_args()
    
    if args.eval_only:
        if not os.path.exists(args.output):
            print(f"Error: Model not found at {args.output}")
            sys.exit(1)
        evaluate_model(args.output, args.test_data)
    else:
        # Train model
        model = train_model(
            train_data_path=args.train_data,
            output_path=args.output,
            epochs=args.epochs,
            batch_size=args.batch_size,
        )
        
        # Evaluate if test data exists
        if os.path.exists(args.test_data):
            print("\nEvaluating trained model...")
            evaluate_model(args.output, args.test_data)
        else:
            print(f"\nTest data not found at {args.test_data}, skipping evaluation")