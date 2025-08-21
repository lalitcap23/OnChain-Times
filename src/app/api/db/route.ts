import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const news = await prisma.news.findMany({
      where: { has_seen: false },
      select: {
        id: true,
        title: true,
        summary: true,
        author: true,
        confidence_score: true,
        has_minted: true,
        has_seen: true,
      },
    });
    const unseenCount = await prisma.news.count({
      where: { has_seen: false },
    });

    return NextResponse.json(
      { count: unseenCount, news }, // Return count and news list
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching news from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch news from database" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { id, hasSeen } = body;

      const updateSeen = await prisma.news.update({
        where: { id },
        data: { has_seen: hasSeen },
      })
  
  
      return NextResponse.json( "seen updated", { status: 200 });
    } catch (error) {
      console.error("Error fetching news:", error);
      return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }
  }