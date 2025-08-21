FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for BeautifulSoup and SSL
RUN apt-get update && \
    apt-get install -y gcc libxml2-dev libxslt-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose Autonome's required port
EXPOSE 3000

# Run the application on port 3000
CMD ["uvicorn", "news_verification_api:app", "--host", "0.0.0.0", "--port", "3000"]