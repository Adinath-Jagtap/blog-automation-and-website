from pymongo import MongoClient
from config import MONGO_URI, DB_NAME, COLLECTION_NAME

def get_existing_titles():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    existing = collection.find({}, {'title': 1})
    titles = [doc['title'].lower().strip() for doc in existing]
    
    client.close()
    return titles

def deduplicate_news(headlines):
    existing_titles = get_existing_titles()
    new_headlines = []
    
    for headline in headlines:
        title_lower = headline['title'].lower().strip()
        if title_lower not in existing_titles:
            new_headlines.append(headline)
    
    return new_headlines