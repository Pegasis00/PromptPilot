import re


def estimate_tokens(text: str) -> int:
    """Approximate token count. Roughly 4 chars per token for English text."""
    if not text:
        return 0
    # More accurate: split on whitespace and punctuation
    words = len(re.findall(r'\w+', text))
    chars = len(text)
    # Blend word-based and char-based estimates
    word_estimate = int(words * 1.3)
    char_estimate = int(chars / 4)
    return max(1, (word_estimate + char_estimate) // 2)


def estimate_output_tokens(prompt_tokens: int, mode: str) -> int:
    """Estimate how many output tokens the refined prompt might generate."""
    multipliers = {
        "detailed": 2.5,
        "balanced": 1.8,
        "minimal": 1.2,
    }
    return int(prompt_tokens * multipliers.get(mode, 1.8))


def calculate_reduction(original: int, optimized: int) -> float:
    if original == 0:
        return 0.0
    return round(((original - optimized) / original) * 100, 1)
