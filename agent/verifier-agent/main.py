import os
import re
import json
import requests
from typing import Dict, Any, Optional
import time

# Core libraries
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Web scraping and search
import together  

# Load environment variables
load_dotenv()


class NewsVerificationAgent:
    def __init__(self):
        """
        Initialize the NewsVerificationAgent with API clients and configurations.
        """
        # API Keys
        self.together_api_key = os.getenv("TOGETHER_API_KEY")

        # Initialize Together AI client for LLM verification
        self.llm = together.Together(api_key=self.together_api_key)

    def scrape_website(self, url: str) -> Optional[str]:
        """
        Extracts and cleans the main content from a news article webpage.

        Args:
            url (str): The URL of the news article.

        Returns:
            Optional[str]: Extracted article content (first 5000 chars) or None if scraping fails.
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                              '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }

            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Remove unnecessary elements
            for script in soup(["script", "style", "nav", "header", "footer"]):
                script.decompose()

            # Extract main content
            main_content = soup.find_all(['article', 'div'], class_=re.compile(r'(article|content|main|body)'))

            if not main_content:
                main_content = [soup.body]

            # Extract text
            text = ' '.join([elem.get_text(strip=True) for elem in main_content])

            # Clean and limit text
            text = re.sub(r'\s+', ' ', text)
            return text[:5000]

        except Exception as e:
            print(f"Scraping Error for {url}: {e}")
            return None

    def verify_news(self, headline: str, description: str, source_url: str) -> Dict[str, Any]:
        """
        Verifies a news story by comparing scraped content with LLM analysis.

        Args:
            headline (str): The news headline.
            description (str): The news description.
            source_url (str): The URL of the news article.

        Returns:
            Dict[str, Any]: Verification results including confidence score, matches, discrepancies.
        """
        # Scrape website content
        scraped_content = self.scrape_website(source_url)

        if not scraped_content:
            return {
                "verification_status": "unverified",
                "confidence_score": 0,
                "error": "Unable to scrape website content"
            }

        # Verify content using LLM
        verification_result = self._verify_content(scraped_content, description)

        return verification_result

    def _verify_content(self, scraped_content: str, original_description: str) -> Dict[str, Any]:
        """
        Verify content using Together AI with retry mechanism in case of invalid JSON response.

        Args:
            scraped_content (str): Scraped website content
            original_description (str): Original news description

        Returns:
            Verification results
        """
        if not self.llm:
            return {
                "confidence_score": 0.5,
                "isVerified": False,  # Add the isVerified flag
                "matching_details": [],
                "discrepancies": ["LLM not available for advanced verification"]
            }

        retry_count = 4  # Maximum number of retries
        attempt = 0
        while attempt < retry_count:
            try:
                # Construct messages in Together AI format
                messages = [
                    {"role": "system", "content": "You are a fact-checking AI. Compare the scraped content with the original news description and return a JSON output. The JSON format must include: confidence_score (float between 0 and 1), matching_details (list of strings), and discrepancies (list of strings)."},
                    {"role": "user", "content": f"Scraped Content: {scraped_content[:1000]}\n\nOriginal Description: {original_description}\n\nProvide output in JSON format."},
                ]
                
                # Call Together AI
                response = self.llm.chat.completions.create(
                    model="meta-llama/Llama-Vision-Free",
                    messages=messages,
                    max_tokens=1024,
                    temperature=0.7,
                    top_p=0.7
                )

                # Check if response contains valid data
                if not hasattr(response, "choices") or not response.choices:
                    return {
                        "confidence_score": 0.5,
                        "isVerified": False,  # Add the isVerified flag
                        "matching_details": [],
                        "discrepancies": ["Invalid LLM response structure"]
                    }

                # Get the raw response content
                verification_result = response.choices[0].message.content.strip()

                # Log the response for debugging
                print("Raw LLM Response:", verification_result)

                # Ensure the response is formatted as JSON
                if not verification_result.startswith("{") or not verification_result.endswith("}"):
                    if attempt < retry_count - 1:
                        print(f"Attempt {attempt + 1} failed: LLM response is not properly formatted JSON. Retrying...")
                        attempt += 1
                        time.sleep(2)  # Wait for 2 seconds before retrying
                        continue  # Retry the request
                    else:
                        return {
                            "confidence_score": 0.5,
                            "isVerified": False,  # Add the isVerified flag
                            "matching_details": [],
                            "discrepancies": ["LLM response is not properly formatted JSON"]
                        }

                # Clean and parse the response
                verification_result = verification_result.replace("\n", " ").strip()

                # Try to parse as JSON
                try:
                    parsed_result = json.loads(verification_result)

                    # Add the isVerified flag based on confidence score
                    parsed_result["isVerified"] = parsed_result["confidence_score"] >= 0.7
                    return parsed_result

                except json.JSONDecodeError as e:
                    print("JSON Decode Error:", e)  # Debug log for JSON parsing error
                    if attempt < retry_count - 1:
                        print(f"Attempt {attempt + 1} failed: JSON parsing error. Retrying...")
                        attempt += 1
                        time.sleep(2)  # Wait for 2 seconds before retrying
                        continue  # Retry the request
                    else:
                        return {
                            "confidence_score": 0.5,
                            "isVerified": False,  # Add the isVerified flag
                            "matching_details": [],
                            "discrepancies": [f"JSON parsing error: {str(e)}"]
                        }

            except Exception as e:
                print(f"LLM Verification Error: {e}")
                if attempt < retry_count - 1:
                    print(f"Attempt {attempt + 1} failed: {str(e)}. Retrying...")
                    attempt += 1
                    time.sleep(2)  # Wait for 2 seconds before retrying
                    continue  # Retry the request
                else:
                    return {
                        "confidence_score": 0.5,
                        "isVerified": False,  # Add the isVerified flag
                        "matching_details": [],
                        "discrepancies": [str(e)]
                    }

def verify_news_story(headline: str, description: str, source_url: str) -> Dict[str, Any]:
    """
    Main function to verify a news story.

    Args:
        headline (str): News headline.
        description (str): News description.
        source_url (str): Source URL of the news.

    Returns:
        Dict[str, Any]: Verification results.
    """
    agent = NewsVerificationAgent()
    return agent.verify_news(headline, description, source_url)


# Example usage
if __name__ == "__main__":
    result = verify_news_story(
        headline="Bitcoin Fails To Rise Above $98,000",
        description="Bitcoin price stood at $97,317.23 on Friday.",
        source_url="https://news.abplive.com/business/crypto/crypto-price-today-february-7-check-global-market-cap-bitcoin-btc-ethereum-doge-solana-litecoin-bera-ena-live-tv-1749696"
    )

    print(json.dumps(result, indent=2))
