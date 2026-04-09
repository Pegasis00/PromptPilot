from fastapi import APIRouter, HTTPException
from app.schemas.prompt import (
    PromptRequest, PromptResponse,
    CompressRequest, CompressResponse,
    AnalyzeRequest, AnalyzeResponse,
    TokenStats, QualityScore
)
from app.services.groq_service import refine_prompt, compress_prompt, analyze_prompt
from app.utils.tokens import estimate_tokens, estimate_output_tokens, calculate_reduction

router = APIRouter()


@router.post("/refine", response_model=PromptResponse)
async def refine_prompt_endpoint(request: PromptRequest):
    if not request.raw_input.strip():
        raise HTTPException(status_code=400, detail="Input cannot be empty")
    if len(request.raw_input) > 10000:
        raise HTTPException(status_code=400, detail="Input too long (max 10000 chars)")

    try:
        result = await refine_prompt(
            raw_input=request.raw_input,
            target_model=request.target_model.value,
            mode=request.mode.value,
            custom_instructions=request.custom_instructions or ""
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM service error: {str(e)}")

    input_tokens = estimate_tokens(request.raw_input)
    optimized_tokens = estimate_tokens(result["refined_prompt"])
    compressed_tokens = estimate_tokens(result["compressed_prompt"])
    est_output = estimate_output_tokens(optimized_tokens, request.mode.value)

    qa = result["quality_analysis"]

    return PromptResponse(
        refined_prompt=result["refined_prompt"],
        compressed_prompt=result["compressed_prompt"],
        token_stats=TokenStats(
            input_tokens=input_tokens,
            optimized_tokens=optimized_tokens,
            estimated_output_tokens=est_output,
            total_estimated=optimized_tokens + est_output,
            reduction_percentage=calculate_reduction(input_tokens, compressed_tokens)
        ),
        quality_score=QualityScore(
            clarity=qa["clarity"],
            structure=qa["structure"],
            specificity=qa["specificity"],
            token_efficiency=qa["token_efficiency"],
            overall=qa["overall"],
            feedback=qa["feedback"],
            strengths=qa.get("strengths", []),
            improvements=qa.get("improvements", [])
        ),
        target_model=request.target_model.value,
        mode=request.mode.value
    )


@router.post("/compress", response_model=CompressResponse)
async def compress_prompt_endpoint(request: CompressRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        compressed = await compress_prompt(
            prompt=request.prompt,
            target_reduction=request.target_reduction,
            target_model=request.target_model.value
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM service error: {str(e)}")

    original_tokens = estimate_tokens(request.prompt)
    compressed_tokens = estimate_tokens(compressed)

    return CompressResponse(
        compressed_prompt=compressed,
        original_tokens=original_tokens,
        compressed_tokens=compressed_tokens,
        reduction_percentage=calculate_reduction(original_tokens, compressed_tokens)
    )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_prompt_endpoint(request: AnalyzeRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        analysis = await analyze_prompt(
            prompt=request.prompt,
            target_model=request.target_model.value
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM service error: {str(e)}")

    tokens = estimate_tokens(request.prompt)
    est_output = estimate_output_tokens(tokens, "balanced")

    return AnalyzeResponse(
        quality_score=QualityScore(
            clarity=analysis["clarity"],
            structure=analysis["structure"],
            specificity=analysis["specificity"],
            token_efficiency=analysis["token_efficiency"],
            overall=analysis["overall"],
            feedback=analysis["feedback"],
            strengths=analysis.get("strengths", []),
            improvements=analysis.get("improvements", [])
        ),
        token_stats=TokenStats(
            input_tokens=tokens,
            optimized_tokens=tokens,
            estimated_output_tokens=est_output,
            total_estimated=tokens + est_output,
            reduction_percentage=0.0
        )
    )
