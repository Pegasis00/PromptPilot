import json
import re
import httpx
from groq import AsyncGroq
from app.core.config import settings

_client: AsyncGroq | None = None
_http_client: httpx.AsyncClient | None = None


def get_client() -> AsyncGroq:
    global _client, _http_client

    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not configured")

    if _client is None:
        # Groq 0.12.0 expects an older httpx default client shape. Supplying an
        # explicit AsyncClient keeps startup working with newer httpx releases.
        _http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(timeout=60.0, connect=5.0),
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
            follow_redirects=True,
        )
        _client = AsyncGroq(api_key=settings.GROQ_API_KEY, http_client=_http_client)

    return _client


def _stringify_prompt_value(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        parts = [_stringify_prompt_value(item) for item in value]
        return "\n\n".join(part for part in parts if part).strip()
    if isinstance(value, dict):
        preferred_keys = [
            "prompt",
            "refined_prompt",
            "compressed_prompt",
            "content",
            "text",
            "instructions",
            "body",
        ]
        for key in preferred_keys:
            nested = value.get(key)
            if nested:
                flattened = _stringify_prompt_value(nested)
                if flattened:
                    return flattened
        lines = []
        for key, nested in value.items():
            flattened = _stringify_prompt_value(nested)
            if flattened:
                label = key.replace("_", " ").strip().title()
                lines.append(f"{label}: {flattened}")
        return "\n".join(lines).strip()
    return str(value).strip()


def _coerce_score(value: object, default: int = 0) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return max(0, min(100, int(round(value))))
    if isinstance(value, str):
        match = re.search(r"\d+", value)
        if match:
            return max(0, min(100, int(match.group())))
    return default


def _normalize_quality_analysis(data: object) -> dict:
    quality = data if isinstance(data, dict) else {}
    clarity = _coerce_score(quality.get("clarity"))
    structure = _coerce_score(quality.get("structure"))
    specificity = _coerce_score(quality.get("specificity"))
    token_efficiency = _coerce_score(quality.get("token_efficiency"))
    overall = _coerce_score(
        quality.get("overall"),
        default=round((clarity + structure + specificity + token_efficiency) / 4),
    )

    strengths = quality.get("strengths", [])
    if not isinstance(strengths, list):
        strengths = [strengths] if strengths else []

    improvements = quality.get("improvements", [])
    if not isinstance(improvements, list):
        improvements = [improvements] if improvements else []

    return {
        "clarity": clarity,
        "structure": structure,
        "specificity": specificity,
        "token_efficiency": token_efficiency,
        "overall": overall,
        "feedback": _stringify_prompt_value(quality.get("feedback")),
        "strengths": [_stringify_prompt_value(item) for item in strengths if _stringify_prompt_value(item)],
        "improvements": [_stringify_prompt_value(item) for item in improvements if _stringify_prompt_value(item)],
    }


def _normalize_refine_response(payload: object) -> dict:
    data = payload if isinstance(payload, dict) else {}
    refined_prompt = _stringify_prompt_value(data.get("refined_prompt"))
    compressed_prompt = _stringify_prompt_value(data.get("compressed_prompt"))

    if not compressed_prompt and refined_prompt:
        compressed_prompt = refined_prompt

    return {
        "refined_prompt": refined_prompt,
        "compressed_prompt": compressed_prompt,
        "quality_analysis": _normalize_quality_analysis(data.get("quality_analysis")),
    }


MODEL_STYLES = {
    "claude": """You are optimizing for Anthropic's Claude model. Claude responds best to:
- Clear markdown structure with headers and bullet points
- Explicit role definitions (e.g., "You are an expert...")
- Step-by-step reasoning instructions
- Explicit output format specifications
- Thoughtful constraints and edge cases""",

    "gpt": """You are optimizing for OpenAI's GPT models. GPT responds best to:
- Concise, actionable instructions
- Direct language without excessive context
- Clear task specification upfront
- Numbered steps for procedures
- Explicit output format at the end""",

    "gemini": """You are optimizing for Google's Gemini model. Gemini responds best to:
- Contextual and explanatory framing
- Natural language with structured sections
- Background context before the task
- Multimodal considerations when relevant
- Comprehensive but readable formatting""",

    "grok": """You are optimizing for xAI's Grok model. Grok responds best to:
- Direct, no-fluff instructions
- Real-world grounded context
- Conversational yet precise language
- Up-to-date knowledge considerations
- Straightforward output expectations""",

    "custom": """You are optimizing for a generic LLM. Use universal best practices:
- Clear role and objective definition
- Structured task breakdown
- Explicit constraints and scope
- Format specifications
- Example outputs if helpful"""
}

MODE_INSTRUCTIONS = {
    "detailed": "Generate a DETAILED, comprehensive prompt with maximum clarity. Include all context, constraints, edge cases, examples, and output specifications. Prioritize completeness over brevity.",
    "balanced": "Generate a BALANCED prompt that is clear and well-structured but efficient. Include essential context, key constraints, and output format without excess verbosity.",
    "minimal": "Generate a MINIMAL, token-efficient prompt. Keep only critical instructions and intent. Remove all unnecessary context. Every word must earn its place."
}


async def refine_prompt(raw_input: str, target_model: str, mode: str, custom_instructions: str = "") -> dict:
    client = get_client()
    model_style = MODEL_STYLES.get(target_model, MODEL_STYLES["custom"])
    mode_instruction = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["balanced"])

    system_prompt = f"""You are PromptPilot AI, an expert prompt engineer specializing in crafting highly effective AI prompts.

{model_style}

Your task: Transform the user's rough input into a polished, professional prompt.

Mode: {mode_instruction}

{f"Additional instructions: {custom_instructions}" if custom_instructions else ""}

You MUST respond with ONLY a valid JSON object. No markdown, no explanation outside the JSON.

Return this exact structure:
{{
  "refined_prompt": "The full refined prompt ready to use",
  "compressed_prompt": "A shorter version preserving core intent (30-40% shorter than refined)",
  "quality_analysis": {{
    "clarity": <score 1-100>,
    "structure": <score 1-100>,
    "specificity": <score 1-100>,
    "token_efficiency": <score 1-100>,
    "overall": <average of all scores>,
    "feedback": "<2-3 sentence overall assessment>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "improvements": ["<improvement 1>", "<improvement 2>"]
  }}
}}"""

    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Transform this rough input into an optimized prompt:\n\n{raw_input}"}
        ],
        temperature=0.4,
        max_tokens=3000,
    )

    content = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    content = re.sub(r'^```(?:json)?\s*', '', content)
    content = re.sub(r'\s*```$', '', content)

    return _normalize_refine_response(json.loads(content))


async def compress_prompt(prompt: str, target_reduction: int, target_model: str) -> str:
    client = get_client()
    model_style = MODEL_STYLES.get(target_model, MODEL_STYLES["custom"])

    system_prompt = f"""You are an expert prompt compressor. Your job is to reduce a prompt by approximately {target_reduction}% while preserving ALL essential meaning and intent.

{model_style}

Rules:
- Remove redundant phrases
- Condense verbose explanations
- Keep all critical constraints
- Preserve output format requirements
- Never lose core task intent
- Return ONLY the compressed prompt text, nothing else."""

    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Compress this prompt by ~{target_reduction}%:\n\n{prompt}"}
        ],
        temperature=0.3,
        max_tokens=2000,
    )

    return _stringify_prompt_value(response.choices[0].message.content)


async def analyze_prompt(prompt: str, target_model: str) -> dict:
    client = get_client()
    model_style = MODEL_STYLES.get(target_model, MODEL_STYLES["custom"])

    system_prompt = f"""You are an expert prompt analyst. Evaluate the given prompt for quality.

{model_style}

Respond with ONLY a valid JSON object:
{{
  "clarity": <score 1-100>,
  "structure": <score 1-100>,
  "specificity": <score 1-100>,
  "token_efficiency": <score 1-100>,
  "overall": <average>,
  "feedback": "<2-3 sentence assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}}"""

    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analyze this prompt:\n\n{prompt}"}
        ],
        temperature=0.2,
        max_tokens=1000,
    )

    content = response.choices[0].message.content.strip()
    content = re.sub(r'^```(?:json)?\s*', '', content)
    content = re.sub(r'\s*```$', '', content)
    return _normalize_quality_analysis(json.loads(content))
