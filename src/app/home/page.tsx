"use client";
import React, { useState, useEffect } from "react";
import TinderCard from "react-tinder-card";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Newspaper, Clock, Globe, ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  description: string;
  urlToImage?: string;
  source: string;
  publishedAt: string;
  url: string;
  hasSeen: boolean;
  id?: string;
}

const categories = [
  { id: "technology", label: "Technology", icon: "🚀" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "ai", label: "AI", icon: "🤖" },
  { id: "india", label: "India News", icon: "🇮🇳" },
];

const fetchNewsForCategory = async (category: string): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`/api/news?category=${category}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${category} news:`, error);
    return [];
  }
};

export default function Page() {
  const [newsList, setNewsList] = useState<{ [key: string]: NewsItem[] }>({});
  const [selectedCategory, setSelectedCategory] = useState("technology");
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const fetchAllNews = async () => {
      setLoading(true);
      const newsData: { [key: string]: NewsItem[] } = {};
      for (const category of categories) {
        newsData[category.id] = await fetchNewsForCategory(category.id);
      }
      setNewsList(newsData);
      setLoading(false);
    };
    fetchAllNews();
  }, []);

  const onSwipe = async (direction: string, news: NewsItem) => {
    if (!news.id) return;
    try {
      await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasSeen: true, id: news.id }),
      });
    } catch (error) {
      console.error("Error updating news:", error);
    }
  };

  const MobileView = () => (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Category Selector */}
      <div className="flex overflow-x-auto p-4 gap-2 bg-gray-800/50 backdrop-blur-lg">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? "bg-violet-600 text-white"
                : "bg-gray-700/50 hover:bg-gray-600/50"
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* News Cards */}
      <div className="flex-1 p-4">
        <div className="relative w-full h-[70vh]">
          <AnimatePresence>
            {newsList[selectedCategory]?.map((news, index) => (
              <TinderCard
                key={index}
                onSwipe={(dir) => onSwipe(dir, news)}
                preventSwipe={[]}
                className="absolute w-full h-full"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Card className="w-full h-full overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border-gray-700">
                    {news.urlToImage && (
                      <div className="w-full h-48 relative">
                        <img
                          src={news.urlToImage}
                          alt={news.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                      </div>
                    )}
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-xl font-bold text-white">{news.title}</h2>
                      <p className="text-gray-300">{news.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Newspaper className="w-4 h-4" />
                          <span>{news.source}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(news.publishedAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TinderCard>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  const DesktopView = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 ">
      {/* Category Tabs */}
      <div className="flex gap-4 mt-8 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              selectedCategory === category.id
                ? "bg-violet-600 text-white scale-105"
                : "bg-gray-800/50 hover:bg-gray-700/50"
            }`}
          >
            <span className="text-xl">{category.icon}</span>
            <span className="font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Featured News Carousel */}
      <div className="mb-12">
        <Carousel className="w-full">
          <CarouselContent>
            {newsList[selectedCategory]?.slice(0, 5).map((news, index) => (
              <CarouselItem key={index}>
                <Card className="border-0 overflow-hidden bg-gradient-to-br from-violet-600/20 to-purple-600/20 backdrop-blur-lg">
                  <CardContent className="p-8 grid grid-cols-2 gap-8">
                    {news.urlToImage && (
                      <div className="relative h-[300px] rounded-lg overflow-hidden">
                        <img
                          src={news.urlToImage}
                          alt={news.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold">{news.title}</h2>
                      <p className="text-gray-300 text-lg">{news.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span>{news.source}</span>
                        </div>
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-violet-400 hover:text-violet-300"
                        >
                          <span>Read More</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="text-white" />
          <CarouselNext className="text-white" />
        </Carousel>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {newsList[selectedCategory]?.map((news, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:scale-105 transition-all duration-300 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border-gray-700">
                {news.urlToImage && (
                  <div className="w-full h-48 relative">
                    <img
                      src={news.urlToImage}
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  </div>
                )}
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-white">{news.title}</h3>
                  <p className="text-gray-300">{news.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Newspaper className="w-4 h-4" />
                      <span>{news.source}</span>
                    </div>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-violet-400 hover:text-violet-300"
                    >
                      <span>Read More</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      )}
    </div>
  );

  return isDesktop ? <DesktopView /> : <MobileView />;
}