import re
import hashlib
from pymongo import MongoClient
from datetime import datetime
from config import MONGO_URI, DB_NAME, COLLECTION_NAME

def make_slug(title, unique_key):
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:80]
    suffix = hashlib.md5(unique_key.encode()).hexdigest()[:6]
    return f"{slug}-{suffix}"

def store_articles(articles):
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    stored_count = 0
    for article in articles:
        if article:
            article['created_at'] = datetime.now().isoformat()
            article['slug'] = make_slug(article['title'], article['source_link'])
            try:
                collection.insert_one(article)
                stored_count += 1
                print(f"Stored: {article['title']}")
            except Exception as e:
                print(f"Error storing article: {e}")

    client.close()
    return stored_count