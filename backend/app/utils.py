import random

def demo_rescale(score: float) -> float:
    """Stretch raw model scores into demo-friendly 0.1–0.9 range."""
    return max(0.01, min(0.99, score * 4.0 + 0.1))

def demo_adjust(score: float) -> float:
    """Rescale + add small jitter so patients don’t all look the same."""
    base = demo_rescale(score)
    return round(min(0.99, max(0.01, base + random.uniform(-0.05, 0.05))), 3)

def band_from_score(score: float) -> str:
    """Convert numeric risk score into low/medium/high band."""
    if score < 0.3:
        return "low"
    elif score < 0.6:
        return "medium"
    else:
        return "high"