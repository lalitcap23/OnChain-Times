"use server";
import prisma from "../db/prisma";

export default async function SubNews(
  title: string,
  description: string,
  score: number
) {
  // pushing to database

  const response = await prisma.news.create({
    data: {
      title: title,
      summary: description,
      author: "fetch from middleware",
      confidence_score: score,
    },
  });

  const resID = response.id;

  return resID;
}

// id String @unique @default(cuid())
// title String
// description String
// author String
// trustScore Int
// mint_price Int
