from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import prompt, health
from app.core.config import settings

app = FastAPI(
    title="PromptPilot AI",
    description="AI-powered prompt optimization platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(prompt.router, prefix="/api/prompt", tags=["prompt"])


@app.get("/")
async def root():
    return {"message": "PromptPilot AI Backend", "version": "1.0.0", "status": "running"}
