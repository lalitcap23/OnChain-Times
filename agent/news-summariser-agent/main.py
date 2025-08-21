import os
from typing import List, Dict, Optional, Union, Any
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import requests
import asyncio
import json
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from contextlib import asynccontextmanager

class NewsArticle(BaseModel):
    title: str = Field(description="Title of the article")
    source: str = Field(description="Source of the article")
    published_date: str = Field(description="Publication date")
    summary: str = Field(description="Summary of the article content")
    url: str = Field(description="URL of the article")

class NewsAPIRequest(BaseModel):
    endpoint: str = Field(description="API endpoint (everything or top-headlines)")
    params: Dict = Field(description="Query parameters")

class SummarizeRequest(BaseModel):
    url: Optional[str] = None
    params: Optional[Dict[str, Any]] = None
    max_articles: int = 5

app = FastAPI()

class NewsSummarizerAgent:
    def __init__(self, news_api_key: str, openai_api_key: str):
        self.news_api_key = news_api_key
        self.base_url = "https://newsapi.org/v2"
        self.llm = ChatOpenAI(
            temperature=0.1,
            model="gpt-4o-mini",
            api_key=openai_api_key
        )
        
        self.summary_prompt = PromptTemplate(
            input_variables=["content", "title"],
            template="""
            Please provide a concise summary of the following news article:
            
            Title: {title}
            Content: {content}
            
            Summary (in 2-3 sentences, focusing on key points and maintaining journalistic neutrality):
            """
        )
        
        self.summary_chain = LLMChain(
            llm=self.llm,
            prompt=self.summary_prompt
        )

    def parse_news_api_url(self, url: str) -> NewsAPIRequest:
        """Parse a NewsAPI URL into endpoint and parameters."""
        parsed = urlparse(url)
        path_parts = parsed.path.split('/')
        
        
        endpoint = path_parts[-1]
        
        
        params = parse_qs(parsed.query)
        
        params = {k: v[0] for k, v in params.items()}
        
        
        params.pop('apiKey', None)
        
        return NewsAPIRequest(endpoint=endpoint, params=params)

    def fetch_news(self, url_or_params: Union[str, Dict], max_articles: int = 5) -> List[Dict]:
        """Fetch news articles from NewsAPI using either URL or parameters."""
        if isinstance(url_or_params, str):
         
            request_info = self.parse_news_api_url(url_or_params)
            endpoint = request_info.endpoint
            params = request_info.params
        else:
           
            endpoint = url_or_params.pop('endpoint', 'everything')
            params = url_or_params.copy()  

        
        params['apiKey'] = self.news_api_key
        params['pageSize'] = max_articles

      
        url = f"{self.base_url}/{endpoint}"
        response = requests.get(url, params=params)
        
        if response.status_code != 200:
            error_msg = f"NewsAPI request failed: {response.json().get('message', 'Unknown error')}"
            raise Exception(error_msg)

        return response.json()["articles"]

    async def summarize_article(self, article: Dict) -> NewsArticle:
        """Summarize a single article using LangChain."""
        content = article.get("content", "") or article.get("description", "")
        title = article["title"]
        
        if not content:
            return NewsArticle(
                title=title,
                source=article["source"]["name"],
                published_date=article["publishedAt"],
                summary="No content available for summarization.",
                url=article["url"]
            )
        
        
        summary_result = await asyncio.to_thread(
            self.summary_chain.invoke,
            {"content": content, "title": title}
        )
        
        return NewsArticle(
            title=title,
            source=article["source"]["name"],
            published_date=article["publishedAt"],
            summary=summary_result["text"].strip(),
            url=article["url"]
        )

    async def process_news_streaming(self, query: Union[str, Dict], max_articles: int = 5):
        """Process news articles and yield them one by one as they're processed."""
        articles = self.fetch_news(query, max_articles)
        
        for i, article in enumerate(articles, 1):
            try:
                summary = await self.summarize_article(article)
                yield json.dumps({
                    "article_num": i,
                    "total_articles": len(articles),
                    "data": summary.dict()
                }) + "\n"
            except Exception as e:
                error_msg = f"Error processing article {article['title'] if 'title' in article else 'unknown'}: {str(e)}"
                yield json.dumps({
                    "article_num": i,
                    "total_articles": len(articles),
                    "error": error_msg
                }) + "\n"
                continue


@asynccontextmanager
async def get_news_summarizer():
    
    news_api_key = os.getenv("NEWS_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    if not news_api_key or not openai_api_key:
        raise ValueError("Please set NEWS_API_KEY and OPENAI_API_KEY environment variables")
    
    
    agent = NewsSummarizerAgent(news_api_key, openai_api_key)
    try:
        yield agent
    finally:
        
        pass

@app.post("/summarize")
async def summarize_news(request: SummarizeRequest):
    async with get_news_summarizer() as agent:
        
        query = request.url if request.url else request.params
        if not query:
            raise HTTPException(status_code=400, detail="Either url or params must be provided")
        
        
        return StreamingResponse(
            agent.process_news_streaming(query, request.max_articles),
            media_type="application/x-ndjson"
        )

@app.post("/top-headlines")
async def get_top_headlines(request: SummarizeRequest):
    async with get_news_summarizer() as agent:
        
        if request.params:
            params = request.params.copy()
            params["endpoint"] = "top-headlines"
            query = params
        
        elif request.url:
            parsed = urlparse(request.url)
            if "top-headlines" not in parsed.path:
                raise HTTPException(status_code=400, detail="URL must be for top-headlines endpoint")
            query = request.url
        else:
            
            query = {"endpoint": "top-headlines", "country": "us"}
        
        
        return StreamingResponse(
            agent.process_news_streaming(query, request.max_articles),
            media_type="application/x-ndjson"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)