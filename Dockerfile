FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Hugging Face porti (7860) va botni ishga tushirish
CMD ["python", "bot.py"]
