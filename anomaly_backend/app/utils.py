def is_anomaly(score: float, threshold: float = 0.000087) -> bool:
    """
    Determines whether the given reconstruction error score is an anomaly
    based on a fixed Youden's J threshold.

    Args:
        score (float): The reconstruction error.
        threshold (float, optional): The anomaly detection threshold.

    Returns:
        bool: True if the score exceeds the threshold, indicating an anomaly.
    """
    return score > threshold
