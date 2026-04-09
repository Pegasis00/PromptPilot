from pydantic import BaseModel
from typing import Optional, Literal
from enum import Enum


class TargetModel(str, Enum):
    claude = "claude"
    gpt = "gpt"
    gemini = "gemini"
    grok = "grok"
    custom = "custom"


class OptimizationMode(str, Enum):
    detailed = "detailed"
    balanced = "balanced"
    minimal = "minimal"


class PromptRequest(BaseModel):
    raw_input: str
    target_model: TargetModel = TargetModel.claude
    mode: OptimizationMode = OptimizationMode.balanced
    custom_instructions: Optional[str] = None


class TokenStats(BaseModel):
    input_tokens: int
    optimized_tokens: int
    estimated_output_tokens: int
    total_estimated: int
    reduction_percentage: float


class QualityScore(BaseModel):
    clarity: int
    structure: int
    specificity: int
    token_efficiency: int
    overall: int
    feedback: str
    strengths: list[str]
    improvements: list[str]


class PromptResponse(BaseModel):
    refined_prompt: str
    compressed_prompt: str
    token_stats: TokenStats
    quality_score: QualityScore
    target_model: str
    mode: str


class CompressRequest(BaseModel):
    prompt: str
    target_reduction: int = 30  # percent
    target_model: TargetModel = TargetModel.claude


class CompressResponse(BaseModel):
    compressed_prompt: str
    original_tokens: int
    compressed_tokens: int
    reduction_percentage: float


class AnalyzeRequest(BaseModel):
    prompt: str
    target_model: TargetModel = TargetModel.claude


class AnalyzeResponse(BaseModel):
    quality_score: QualityScore
    token_stats: TokenStats
