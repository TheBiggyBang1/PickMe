"""
Evaluate resume-job matching model performance.

This script provides comprehensive evaluation metrics for the matching engine:
- Precision, Recall, F1 at different thresholds
- Mean Reciprocal Rank (MRR)
- NDCG (Normalized Discounted Cumulative Gain)
- Confusion matrix visualization
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Tuple
import json
import numpy as np
from collections import defaultdict

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from sentence_transformers import SentenceTransformer
from sklearn.metrics import precision_recall_fscore_support, confusion_matrix
import matplotlib
# Use a non-interactive backend to avoid GUI-related import/runtime issues
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def load_test_data(test_path: str) -> List[Dict]:
    """
    Load test data with ground truth labels.
    
    Expected format:
    [
        {
            "resume": "text...",
            "job": "text...",
            "is_match": true,  # ground truth
            "relevance_score": 0.8  # optional: 0-1 scale
        },
        ...
    ]
    """
    with open(test_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} test pairs")
    return data


def evaluate_matching_accuracy(
    model_path: str,
    test_data_path: str,
    thresholds: List[float] = [0.5, 0.6, 0.7, 0.8, 0.9]
) -> Dict:
    """
    Evaluate matching accuracy at different similarity thresholds.
    
    Returns:
        Dictionary with metrics for each threshold
    """
    print(f"Loading model from: {model_path}")
    model = SentenceTransformer(model_path)
    
    print(f"Loading test data from: {test_data_path}")
    test_data = load_test_data(test_data_path)
    
    # Generate embeddings
    print("Generating embeddings...")
    resumes = [item['resume'] for item in test_data]
    jobs = [item['job'] for item in test_data]
    
    resume_embeddings = model.encode(resumes, convert_to_numpy=True, show_progress_bar=True)
    job_embeddings = model.encode(jobs, convert_to_numpy=True, show_progress_bar=True)
    
    # Compute similarities
    similarities = []
    for i in range(len(test_data)):
        sim = cosine_similarity(resume_embeddings[i], job_embeddings[i])
        similarities.append(sim)
    
    # Ground truth
    y_true = [item['is_match'] for item in test_data]
    
    # Evaluate at each threshold
    results = {}
    for threshold in thresholds:
        y_pred = [sim >= threshold for sim in similarities]
        
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_true, y_pred, average='binary', zero_division=0
        )
        
        # Accuracy
        accuracy = sum(1 for true, pred in zip(y_true, y_pred) if true == pred) / len(y_true)
        
        results[threshold] = {
            'precision': float(precision),
            'recall': float(recall),
            'f1': float(f1),
            'accuracy': float(accuracy),
        }
        
        print(f"\nThreshold: {threshold:.2f}")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall:    {recall:.4f}")
        print(f"  F1:        {f1:.4f}")
        print(f"  Accuracy:  {accuracy:.4f}")
    
    return results


def evaluate_ranking_metrics(
    model_path: str,
    test_data_path: str,
    top_k: int = 10
) -> Dict:
    """
    Evaluate ranking quality using MRR and NDCG.
    
    Test data should include 'relevance_score' field (0-1).
    """
    print(f"Loading model from: {model_path}")
    model = SentenceTransformer(model_path)
    
    print(f"Loading test data from: {test_data_path}")
    test_data = load_test_data(test_data_path)
    
    # Group by resume (for ranking evaluation)
    resume_groups = defaultdict(list)
    for item in test_data:
        resume_groups[item['resume']].append(item)
    
    mrr_scores = []
    ndcg_scores = []
    
    print(f"Evaluating ranking for {len(resume_groups)} resumes...")
    
    for resume_text, candidates in resume_groups.items():
        if len(candidates) < 2:
            continue
        
        # Encode resume once
        resume_emb = model.encode(resume_text, convert_to_numpy=True)
        
        # Compute similarities for all job candidates
        job_texts = [c['job'] for c in candidates]
        job_embeddings = model.encode(job_texts, convert_to_numpy=True)
        
        similarities = [
            cosine_similarity(resume_emb, job_emb) 
            for job_emb in job_embeddings
        ]
        
        # Rank by similarity
        ranked_indices = np.argsort(similarities)[::-1]
        
        # MRR: position of first relevant item
        for rank, idx in enumerate(ranked_indices, start=1):
            if candidates[idx].get('is_match', False):
                mrr_scores.append(1.0 / rank)
                break
        
        # NDCG: use relevance_score if available
        if 'relevance_score' in candidates[0]:
            relevance_scores = [candidates[i].get('relevance_score', 0) for i in ranked_indices[:top_k]]
            ideal_scores = sorted([c.get('relevance_score', 0) for c in candidates], reverse=True)[:top_k]
            
            dcg = sum((2**rel - 1) / np.log2(i + 2) for i, rel in enumerate(relevance_scores))
            idcg = sum((2**rel - 1) / np.log2(i + 2) for i, rel in enumerate(ideal_scores))
            
            if idcg > 0:
                ndcg_scores.append(dcg / idcg)
    
    results = {
        'mrr': float(np.mean(mrr_scores)) if mrr_scores else 0.0,
        'ndcg': float(np.mean(ndcg_scores)) if ndcg_scores else 0.0,
    }
    
    print(f"\nRanking Metrics:")
    print(f"  MRR:  {results['mrr']:.4f}")
    print(f"  NDCG: {results['ndcg']:.4f}")
    
    return results


def plot_confusion_matrix(
    model_path: str,
    test_data_path: str,
    threshold: float = 0.7,
    output_path: str = "confusion_matrix.png"
):
    """Generate and save confusion matrix plot."""
    print(f"Loading model from: {model_path}")
    model = SentenceTransformer(model_path)
    
    test_data = load_test_data(test_data_path)
    
    resumes = [item['resume'] for item in test_data]
    jobs = [item['job'] for item in test_data]
    
    resume_embeddings = model.encode(resumes, convert_to_numpy=True, show_progress_bar=True)
    job_embeddings = model.encode(jobs, convert_to_numpy=True, show_progress_bar=True)
    
    similarities = [
        cosine_similarity(resume_embeddings[i], job_embeddings[i])
        for i in range(len(test_data))
    ]
    
    y_true = [item['is_match'] for item in test_data]
    y_pred = [sim >= threshold for sim in similarities]
    
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title(f'Confusion Matrix (threshold={threshold})')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(output_path)
    print(f"Confusion matrix saved to: {output_path}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Evaluate resume-job matching model")
    parser.add_argument("--model", default="models/trained_models/multi-qa-MiniLM-L6-cos-v1", help="Model path")
    parser.add_argument("--test-data", default="data/test_pairs.json", help="Test data path")
    parser.add_argument("--thresholds", nargs='+', type=float, default=[0.5, 0.6, 0.7, 0.8, 0.9], help="Thresholds")
    parser.add_argument("--confusion-matrix", action="store_true", help="Generate confusion matrix plot")
    parser.add_argument("--ranking", action="store_true", help="Evaluate ranking metrics")
    parser.add_argument("--output", default="results/evaluation_results.json", help="Output path for results")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.test_data):
        print(f"Error: Test data not found at {args.test_data}")
        print("\nExpected format:")
        print('[')
        print('  {"resume": "text...", "job": "text...", "is_match": true, "relevance_score": 0.8},')
        print('  ...')
        print(']')
        sys.exit(1)
    
    # Evaluate accuracy
    accuracy_results = evaluate_matching_accuracy(args.model, args.test_data, args.thresholds)
    
    # Evaluate ranking if requested
    ranking_results = {}
    if args.ranking:
        ranking_results = evaluate_ranking_metrics(args.model, args.test_data)
    
    # Generate confusion matrix if requested
    if args.confusion_matrix:
        plot_confusion_matrix(args.model, args.test_data, threshold=0.7)
    
    # Save results
    output_dir = Path(args.output).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    results = {
        "model": args.model,
        "test_data": args.test_data,
        "accuracy_by_threshold": accuracy_results,
        "ranking_metrics": ranking_results,
    }
    
    with open(args.output, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to: {args.output}")