import os

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
MONGO_URI = os.environ.get('MONGO_URI')
DB_NAME = 'blog_automation'
COLLECTION_NAME = 'articles'

NEWS_SOURCES = [
    # International News
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
    
    # Tech & Innovation
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://www.wired.com/feed/rss',
    
    # Business & Finance
    'https://feeds.reuters.com/reuters/businessNews',
    'https://feeds.reuters.com/reuters/technologyNews',
    
    # Science & Health
    'https://www.sciencedaily.com/rss/all.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    
    # Reddit Aggregation
    'https://www.reddit.com/r/worldnews/.rss',
    'https://www.reddit.com/r/technology/.rss',
    'https://www.reddit.com/r/science/.rss',
    
    # Additional International
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://rss.dw.com/rdf/rss-en-all',
]

TIMEFRAME_HOURS = 24