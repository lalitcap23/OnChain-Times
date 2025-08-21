import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEW_API;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "technology";
    const country = searchParams.get("country") || "us";

    let endpoint = "https://newsapi.org/v2/top-headlines";
    let params: any = { apiKey: NEWS_API_KEY };

    // Handle different categories
    switch (category) {
      case "technology":
        params.category = "technology";
        params.country = country;
        break;
      case "business":
        params.category = "business";
        params.country = country;
        break;
      case "ai":
        endpoint = "https://newsapi.org/v2/everything";
        params.q = "artificial intelligence OR machine learning";
        params.sortBy = "publishedAt";
        break;
      case "india":
        params.country = "in";
        break;
      default:
        params.category = category;
        params.country = country;
    }

    const response = await axios.get(endpoint, { params });
    const news = (response.data as { articles: any[] }).articles || [];
    
    const processedNews = news.map((n: any) => ({
      title: n.title,
      description: n.description,
      urlToImage: n.urlToImage,
      source: n.source.name,
      publishedAt: n.publishedAt,
      url: n.url,
      hasSeen: false,
    }));

    return NextResponse.json(processedNews, { status: 200 });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category = "technology", country = "us" } = body;

    let endpoint = "https://newsapi.org/v2/top-headlines";
    let params: any = { apiKey: NEWS_API_KEY };

    switch (category) {
      case "technology":
        params.category = "technology";
        params.country = country;
        break;
      case "business":
        params.category = "business";
        params.country = country;
        break;
      case "ai":
        endpoint = "https://newsapi.org/v2/everything";
        params.q = "artificial intelligence OR machine learning";
        params.sortBy = "publishedAt";
        break;
      case "india":
        params.country = "in";
        break;
      default:
        params.category = category;
        params.country = country;
    }

    const response = await axios.get<{ articles: any[] }>(endpoint, { params });
    const news = response.data.articles || [];
    
    const processedNews = news.map((n: any) => ({
      title: n.title,
      description: n.description,
      urlToImage: n.urlToImage,
      source: n.source.name,
      publishedAt: n.publishedAt,
      url: n.url,
      hasSeen: false,
    }));

    return NextResponse.json(processedNews, { status: 200 });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}