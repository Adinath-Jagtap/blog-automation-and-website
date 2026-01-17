import os
from datetime import datetime, timedelta

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
MONGO_URI = os.environ.get('MONGO_URI')
DB_NAME = 'blog_automation'
COLLECTION_NAME = 'articles'

NEWS_SOURCES = [
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.reddit.com/r/worldnews/.rss',
]

TIMEFRAME_HOURS = 24