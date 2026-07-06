import feedparser
import random
from datetime import datetime, timedelta, timezone
from config import NEWS_SOURCES, TIMEFRAME_HOURS

# Max articles to take from a single source — prevents any one source dominating
MAX_PER_SOURCE = 10

def safe_published_parsed(entry):
    """Return a sortable tuple from entry, or a zero tuple if missing/None."""
    val = entry.get('published_parsed')
    if val and len(val) >= 6:
        return val
    return (0,) * 9

def fetch_news():
    # Use UTC consistently — RSS feeds report dates in UTC
    now_utc = datetime.now(timezone.utc)
    cutoff_time = now_utc - timedelta(hours=TIMEFRAME_HOURS)
    today_utc_date = now_utc.date()

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
                    # RSS published_parsed is already in UTC (time.struct_time)
                    pub_date = datetime(*parsed[:6], tzinfo=timezone.utc)
                except Exception:
                    continue

                # Gate 1: Must be within the TIMEFRAME_HOURS window
                if pub_date < cutoff_time:
                    continue

                # Gate 2: Must be from TODAY (UTC) — strict freshness filter
                if pub_date.date() != today_utc_date:
                    print(f"  Skipped (not today): {entry.title[:60]}... [{pub_date.date()} != {today_utc_date}]")
                    continue

                all_headlines.append({
                    'title': entry.title,
                    'link': entry.link,
                    'published': pub_date.isoformat(),
                    'source': source_name
                })
                source_count += 1

        except Exception as e:
            print(f"Error fetching from {source}: {e}")

    print(f"Total headlines after today-only filter: {len(all_headlines)}")
    return all_headlines