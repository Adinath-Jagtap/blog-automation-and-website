from pymongo import MongoClient
from config import MONGO_URI, DB_NAME, COLLECTION_NAME
import re

# Words that carry no topic meaning — ignored during similarity check
STOPWORDS = {
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'as', 'it', 'its', 'that', 'this', 'than', 'then', 'into', 'over',
    'after', 'about', 'up', 'out', 'says', 'said', 'has', 'have', 'had',
    'not', 'no', 'new', 'will', 'after', 'amid', 'he', 'she', 'his', 'her'
}

def extract_keywords(title):
    words = re.findall(r'\b[a-z]{3,}\b', title.lower())
    return set(w for w in words if w not in STOPWORDS)

def similarity_score(kw1, kw2):
    if not kw1 or not kw2:
        return 0.0
    intersection = kw1 & kw2
    union = kw1 | kw2
    return len(intersection) / len(union)  # Jaccard similarity

# Two headlines are considered duplicates if their keyword overlap >= this threshold
SIMILARITY_THRESHOLD = 0.45

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
    existing_keywords = [extract_keywords(t) for t in existing_titles]

    new_headlines = []
    # Track keywords of headlines already accepted in this batch
    accepted_keywords = []

    for headline in headlines:
        title_lower = headline['title'].lower().strip()

        # 1. Exact match against DB
        if title_lower in existing_titles:
            continue

        kw = extract_keywords(title_lower)

        # 2. Fuzzy match against DB titles
        too_similar_to_db = any(
            similarity_score(kw, ekw) >= SIMILARITY_THRESHOLD
            for ekw in existing_keywords
        )
        if too_similar_to_db:
            continue

        # 3. Fuzzy match within current batch (avoid processing near-duplicate topics)
        too_similar_in_batch = any(
            similarity_score(kw, akw) >= SIMILARITY_THRESHOLD
            for akw in accepted_keywords
        )
        if too_similar_in_batch:
            continue

        new_headlines.append(headline)
        accepted_keywords.append(kw)

    return new_headlines