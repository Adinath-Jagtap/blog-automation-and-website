from pymongo import MongoClient
from datetime import datetime
from config import MONGO_URI, DB_NAME, COLLECTION_NAME

def store_articles(articles):
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    stored_count = 0
    for article in articles:
        if article:
            article['created_at'] = datetime.now().isoformat()
            article['slug'] = article['title'].lower().replace(' ', '-')[:100]
            
            try:
                collection.insert_one(article)
                stored_count += 1
                print(f"Stored: {article['title']}")
            except Exception as e:
                print(f"Error storing article: {e}")
    
    client.close()
    return stored_count