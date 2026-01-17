import feedparser
import requests
from datetime import datetime, timedelta
from config import NEWS_SOURCES, TIMEFRAME_HOURS

def fetch_news():
    cutoff_time = datetime.now() - timedelta(hours=TIMEFRAME_HOURS)
    all_headlines = []
    
    for source in NEWS_SOURCES:
        try:
            feed = feedparser.parse(source)
            for entry in feed.entries:
                pub_date = datetime(*entry.published_parsed[:6])
                if pub_date >= cutoff_time:
                    all_headlines.append({
                        'title': entry.title,
                        'link': entry.link,
                        'published': pub_date.isoformat(),
                        'source': feed.feed.title if hasattr(feed.feed, 'title') else 'Unknown'
                    })
        except Exception as e:
            print(f"Error fetching from {source}: {e}")
    
    return all_headlines