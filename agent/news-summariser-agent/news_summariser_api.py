import os
from typing import List, Dict, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from main import NewsSummarizerAgent  
import json

# Response Models
class ArticleSummary(BaseModel):
    title: str
    source: str
    published_date: str
    summary: str
    url: str

class NewsResponse(BaseModel):
    status: str = "success"
    query_info: str
    summaries: List[ArticleSummary]
    timestamp: str

# Request Models
class NewsRequest(BaseModel):
    url: Optional[str] = Field(None, description="Full NewsAPI URL")
    params: Optional[Dict] = Field(None, description="Query parameters")
    max_articles: Optional[int] = Field(5, description="Maximum number of articles to process")

# Initialize FastAPI app
app = FastAPI(
    title="News Summarizer API",
    description="API for fetching and summarizing news articles using NewsAPI and LangChain",
    version="1.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modify this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the news summarizer agent
try:
    news_api_key = os.getenv("NEWS_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    if not news_api_key or not openai_api_key:
        raise ValueError("API keys not found in environment variables")
        
    news_agent = NewsSummarizerAgent(news_api_key, openai_api_key)
except Exception as e:
    print(f"Error initializing news agent: {str(e)}")
    news_agent = None

@app.get("/")
async def root():
    return {
        "status": "active",
        "message": "News Summarizer API is running",
        "documentation": "/docs"
    }

@app.post("/summarize")
async def summarize_news_stream(request: NewsRequest = Body(...)):
    """
    Stream summarized news articles as they are processed.
    """
    if not news_agent:
        raise HTTPException(
            status_code=500,
            detail="News agent not properly initialized. Check server logs."
        )
    
    if not request.url and not request.params:
        raise HTTPException(
            status_code=400,
            detail="Either 'url' or 'params' must be provided."
        )
    
    query = request.url if request.url else request.params

    async def article_stream():
        """
        Asynchronous generator to stream article summaries.
        """
        try:
            async for summary in news_agent.process_news_streaming(query, max_articles=request.max_articles):
                yield f"data: {summary}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(article_stream(), media_type="text/event-stream")

@app.get("/top-headlines", response_model=NewsResponse)
async def get_top_headlines(
    country: str = Query(None, description="Country code (e.g., us, gb, in)"),
    category: str = Query(None, description="News category (e.g., business, technology)"),
    q: str = Query(None, description="Search query"),
    max_articles: int = Query(5, description="Maximum number of articles to fetch")
):
    if not news_agent:
        raise HTTPException(
            status_code=500,
            detail="News agent not properly initialized"
        )
    
    try:
        # Build parameters
        params = {
            "endpoint": "top-headlines",
            "country": country,
            "category": category,
            "q": q
        }
        
        # Remove None values
        params = {k: v for k, v in params.items() if v is not None}
        
        if len(params) <= 1:  # Only endpoint remains
            raise HTTPException(
                status_code=400,
                detail="At least one parameter (country, category, or q) must be provided"
            )
        
        # Process news (consume async generator)
        article_summaries = []
        async for s in news_agent.process_news_streaming(params, max_articles=max_articles):
            try:
                # Parse the string into a Python dictionary
                article_data = json.loads(s) if isinstance(s, str) else s
                
                # Extract `data` from the parsed dictionary
                data = article_data.get("data", {})
                
                # Append the parsed and structured article summary
                article_summaries.append(
                    ArticleSummary(
                        title=data.get("title", "N/A"),
                        source=data.get("source", "Unknown"),
                        published_date=data.get("published_date", "N/A"),
                        summary=data.get("summary", "No summary available."),
                        url=data.get("url", "#")
                    )
                )
            except (json.JSONDecodeError, AttributeError, TypeError) as e:
                print(f"Error processing article: {s}, Error: {str(e)}")

        return NewsResponse(
            status="success",
            query_info=str(params),
            summaries=article_summaries,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch or summarize top headlines. Error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
