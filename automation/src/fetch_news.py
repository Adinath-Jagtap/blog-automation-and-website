import feedparser
import random
from datetime import datetime, timedelta
from config import NEWS_SOURCES, TIMEFRAME_HOURS

# Max articles to take from a single source — prevents any one source dominating
MAX_PER_SOURCE = 3

def safe_published_parsed(entry):
    """Return a sortable tuple from entry, or a zero tuple if missing/None."""
    val = entry.get('published_parsed')
    if val and len(val) >= 6:
        return val
    return (0,) * 9

def fetch_news():
    cutoff_time = datetime.now() - timedelta(hours=TIMEFRAME_HOURS)
    all_headlines = []

    # Shuffle so no source always gets priority
    sources = NEWS_SOURCES[:]
    random.shuffle(sources)

    for source in sources:
        try:
            feed = feedparser.parse(source)
            source_name = feed.feed.title if hasattr(feed.feed, 'title') else 'Unknown'
            source_count = 0

            # Sort entries newest first — safe even when published_parsed is None
            entries = sorted(
                feed.entries,
                key=safe_published_parsed,
                reverse=True
            )

            for entry in entries:
                if source_count >= MAX_PER_SOURCE:
                    break

                parsed = entry.get('published_parsed')
                if not parsed or len(parsed) < 6:
                    continue  # skip entries with no parseable date

                try:
                    pub_date = datetime(*parsed[:6])
                except Exception:
                    continue

                if pub_date >= cutoff_time:
                    all_headlines.append({
                        'title': entry.title,
                        'link': entry.link,
                        'published': pub_date.isoformat(),
                        'source': source_name
                    })
                    source_count += 1

        except Exception as e:
            print(f"Error fetching from {source}: {e}")

    return all_headlines