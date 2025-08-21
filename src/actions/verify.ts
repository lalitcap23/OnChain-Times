"use server";

const VERIFY_NEWS = process.env.NEXT_PUBLIC_VERIFY_NEWS;

// export interface VerificationResult {
//   confidence_score: number;
//   isVerified: boolean;
//   matching_details: string[];
//   discrepancies: string[];
// }

export default async function Verify(title: string, description: string, source_url: string) {
  if (!VERIFY_NEWS) {
    throw new Error('VERIFY_NEWS URL is not defined');
  }
  try {
    const response = await fetch(VERIFY_NEWS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        headline: title,
        description,
        source_url
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error("Verification failed:", error);
    return null; // Or handle error differently
  }
}