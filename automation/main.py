from dotenv import load_dotenv
load_dotenv()

from src.fetch_news import fetch_news
from src.compare_deduplicate import deduplicate_news
from src.generate_content import generate_article
from src.store_database import store_articles

def main():
    print("Starting automation...")
    
    print("Fetching news...")
    headlines = fetch_news()
    print(f"Fetched {len(headlines)} headlines")
    
    print("Deduplicating...")
    new_headlines = deduplicate_news(headlines)
    print(f"Found {len(new_headlines)} new headlines")
    
    if not new_headlines:
        print("No new articles to process")
        return
    
    print("Generating articles...")
    articles = []
    for i, headline in enumerate(new_headlines[:10], 1):
        print(f"Processing {i}/10: {headline['title'][:50]}...")
        article = generate_article(headline)
        if article:
            articles.append(article)
    
    print(f"Generated {len(articles)} articles")
    
    print("Storing in database...")
    stored = store_articles(articles)
    print(f"Stored {stored} articles")
    
    print("Automation complete!")

if __name__ == "__main__":
    main()