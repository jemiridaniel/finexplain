FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir aiofiles

COPY frontend/package.json ./frontend/package.json
WORKDIR /app/frontend
RUN npm install
COPY frontend/ ./
RUN npm run build

WORKDIR /app
COPY backend/ ./backend/
COPY data/sample_transactions.csv ./data/sample_transactions.csv

WORKDIR /app/backend
EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]