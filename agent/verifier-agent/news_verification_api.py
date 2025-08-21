import os
import json
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import verification function from main script
from main import verify_news_story

# Load environment variables
load_dotenv()

# Create FastAPI app with Autonome-compatible configuration
app = FastAPI(
    title="News Verification Agent",
    description="AI-powered news verification system using web scraping and LLM analysis",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware (keep as-is)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Updated Request/Response Models
class NewsVerificationRequest(BaseModel):
    headline: str
    description: str
    source_url: str  # Changed from HttpUrl to basic string

class NewsVerificationResponse(BaseModel):
    confidence_score: float
    isVerified: bool
    matching_details: List[str]
    discrepancies: List[str]

# Updated endpoints
@app.post("/verify-news", response_model=NewsVerificationResponse)
async def verify_news(request: NewsVerificationRequest):
    """
    Verify news content against source (Autonome-compatible endpoint)
    """
    try:
        result = verify_news_story(
            headline=request.headline,
            description=request.description,
            source_url=request.source_url 
        )
        
        # Ensure response matches the schema
        return NewsVerificationResponse(
            confidence_score=result.get("confidence_score", 0.0),
            isVerified=result.get("isVerified", False),
            matching_details=result.get("matching_details", []),
            discrepancies=result.get("discrepancies", [])
        )
    
    except Exception as e:
        # Return error response in schema-compatible format
        return NewsVerificationResponse(
            confidence_score=0.0,
            isVerified=False,
            matching_details=[],
            discrepancies=[f"Verification failed: {str(e)}"]
        )

# Keep health check and root endpoint as-is
@app.get("/")
async def root():
    return {
        "service": "News Verification API",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}