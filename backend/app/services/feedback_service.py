import json
import os
from datetime import datetime
from typing import List, Dict
import uuid

FEEDBACK_FILE = "feedback_data.json"

def get_feedback_file_path() -> str:
    """Get the absolute path to the feedback data file."""
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    return os.path.join(backend_dir, FEEDBACK_FILE)

def load_feedbacks() -> List[Dict]:
    """Load all feedbacks from JSON file."""
    file_path = get_feedback_file_path()
    
    if not os.path.exists(file_path):
        return []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('feedbacks', [])
    except Exception as e:
        print(f"Error loading feedbacks: {e}")
        return []

def save_feedback(feedback_type: str, message: str, page: str = None, feature_name: str = None) -> Dict:
    """Save a new feedback entry."""
    feedback_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    feedback_entry = {
        "id": feedback_id,
        "feedback_type": feedback_type,
        "message": message,
        "page": page,
        "feature_name": feature_name,
        "timestamp": timestamp
    }
    
    # Load existing feedbacks
    feedbacks = load_feedbacks()
    
    # Add new feedback
    feedbacks.append(feedback_entry)
    
    # Save to file
    file_path = get_feedback_file_path()
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump({"feedbacks": feedbacks}, f, indent=2, ensure_ascii=False)
        return feedback_entry
    except Exception as e:
        print(f"Error saving feedback: {e}")
        raise

def get_all_feedbacks(limit: int = None, feedback_type: str = None) -> List[Dict]:
    """Get all feedbacks with optional filtering."""
    feedbacks = load_feedbacks()
    
    # Filter by type if specified
    if feedback_type:
        feedbacks = [f for f in feedbacks if f.get('feedback_type') == feedback_type]
    
    # Sort by timestamp (newest first)
    feedbacks.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    
    # Apply limit if specified
    if limit:
        feedbacks = feedbacks[:limit]
    
    return feedbacks

def get_feedback_stats() -> Dict:
    """Get statistics about feedbacks."""
    feedbacks = load_feedbacks()
    
    stats = {
        "total": len(feedbacks),
        "by_type": {}
    }
    
    for feedback in feedbacks:
        feedback_type = feedback.get('feedback_type', 'other')
        stats['by_type'][feedback_type] = stats['by_type'].get(feedback_type, 0) + 1
    
    return stats
