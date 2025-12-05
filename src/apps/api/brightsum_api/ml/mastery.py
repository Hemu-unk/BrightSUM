"""Simple mastery update logic for practice/quiz interactions."""


def update_mastery(prev_mastery: float, is_correct: bool) -> float:
    """Simple incremental mastery update.

    prev_mastery and return value are in [0,1].
    """
    delta_up = 0.06
    delta_down = 0.04

    if is_correct:
        return min(1.0, prev_mastery + delta_up)
    return max(0.0, prev_mastery - delta_down)
