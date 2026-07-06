const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const SITE_URL = 'https://timelesss-updates.netlify.app';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str = '') {
  return escapeHtml(str);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function localDateKey(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'text/html; charset=UTF-8',
    'Cache-Control': 'public, max-age=120, s-maxage=300'
  };

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db('blog_automation');
    const collection = db.collection('articles');

    const articles = await collection
      .find({})
      .project({
        title: 1, summary: 1, slug: 1, source_name: 1,
        published_date: 1, created_at: 1, tags: 1, reading_time: 1
      })
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();

    // ─── Build Hero Section ───
    let heroHtml = '';
    if (articles.length > 0) {
      const featured = articles[0];
      const secondary = articles.slice(1, 4);

      const secondaryCards = secondary.map((a, i) => `
        <div class="hero-secondary-item" onclick="location.href='/article/${encodeURIComponent(a.slug)}'">
          <div class="hero-sec-num">0${i + 2}</div>
          <div class="hero-sec-title">${escapeHtml(a.title)}</div>
          <div class="hero-sec-date">${formatDate(a.published_date)}</div>
        </div>`).join('');

      heroHtml = `
      <section class="hero-section visible" id="hero-section">
        <div class="hero-label">Featured Story</div>
        <div class="hero-grid">
          <div class="hero-main">
            <div class="hero-main-title" id="hero-title" onclick="location.href='/article/${encodeURIComponent(featured.slug)}'" style="cursor:pointer">${escapeHtml(featured.title)}</div>
            <p class="hero-summary" id="hero-summary">${escapeHtml(featured.summary || '')}</p>
            <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
              <a href="/article/${encodeURIComponent(featured.slug)}" class="hero-read-btn" style="text-decoration:none">
                Read Article
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
              <div class="hero-meta">
                <span id="hero-date">${formatDate(featured.published_date)}</span>
                <span>·</span>
                <span id="hero-source">${escapeHtml(featured.source_name || '')}</span>
              </div>
            </div>
          </div>
          <div class="hero-secondary-stack" id="hero-secondary">${secondaryCards}</div>
        </div>
      </section>`;
    }

    // ─── Build Article Cards (grouped by date) ───
    const groups = new Map();
    articles.forEach(article => {
      const key = localDateKey(article.published_date);
      if (!groups.has(key)) {
        groups.set(key, { label: formatDateLabel(article.published_date), items: [] });
      }
      groups.get(key).items.push(article);
    });

    const sortedGroups = [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));

    let globalIdx = 0;
    const cardsHtml = sortedGroups.map(([, group]) => {
      const cards = group.items.map(article => {
        globalIdx++;
        return `
        <a href="/article/${encodeURIComponent(article.slug)}" class="article-card" style="text-decoration:none;opacity:1;transform:none;">
          <div class="card-index">${String(globalIdx).padStart(2, '0')}</div>
          <h2>${escapeHtml(article.title)}</h2>
          <p class="summary">${escapeHtml(article.summary || '')}</p>
          <div class="article-meta">
            <span>${formatDate(article.published_date)}</span>
            <span class="meta-divider">&middot;</span>
            <span>${escapeHtml(article.source_name || '')}</span>
          </div>
        </a>`;
      }).join('');

      return `
      <div class="date-separator">
        <div class="date-separator-line"></div>
        <span class="date-separator-label">${group.label}</span>
        <div class="date-separator-line"></div>
      </div>
      <div class="articles-group">${cards}</div>`;
    }).join('');

    // ─── Current date for header ───
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // ─── ItemList Schema for rich snippets ───
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: articles.slice(0, 20).map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/article/${encodeURIComponent(a.slug)}`,
        name: a.title
      }))
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Timelesss Updates - News, Latest Stories & Daily Updates</title>
<meta name="description" content="Your trusted source for breaking news and timeless stories. Get daily updates on world events, technology, business, and more. Professional journalism you can rely on.">
<meta name="keywords" content="news, breaking news, latest news, world news, daily updates, current events, journalism, timelesss updates, headlines, stories">
<meta name="google-site-verification" content="xLPntKv98Ss_Zt_0afEDX_MUaCaorNkIqSC4PLkT0xY" />
<meta name="google-adsense-account" content="ca-pub-2200531077153999">
<link rel="icon" type="image/png" href="${SITE_URL}/css/logo.png">
<link rel="apple-touch-icon" href="${SITE_URL}/css/logo.png">
<link rel="canonical" href="${SITE_URL}/">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2200531077153999" crossorigin="anonymous"></script>
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE_URL}/">
<meta property="og:title" content="Timelesss Updates - Your Source for Timeless News">
<meta property="og:description" content="Stay informed with Timelesss Updates. Professional news coverage, updated daily with the stories that matter.">
<meta property="og:image" content="${SITE_URL}/css/og-image.png">
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${SITE_URL}/">
<meta property="twitter:title" content="Timelesss Updates - Your Source for Timeless News">
<meta property="twitter:description" content="Stay informed with Timelesss Updates. Professional news coverage, updated daily with the stories that matter.">
<meta property="twitter:image" content="${SITE_URL}/css/og-image.png">
<link rel="stylesheet" href="/css/style.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Timelesss Updates",
  "url": "${SITE_URL}/",
  "description": "Your trusted source for breaking news and timeless stories. Get daily updates on world events, technology, business, and more.",
  "publisher": {
    "@type": "Organization",
    "name": "Timelesss Updates",
    "url": "${SITE_URL}/",
    "logo": { "@type": "ImageObject", "url": "${SITE_URL}/css/logo.png" }
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "${SITE_URL}/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Timelesss Updates",
  "url": "${SITE_URL}/",
  "logo": "${SITE_URL}/css/logo.png",
  "sameAs": ["https://github.com/Adinath-Jagtap", "https://www.youtube.com/@iitian_techLab"],
  "founder": { "@type": "Person", "name": "Adinath Jagtap" }
}
</script>
<script type="application/ld+json">${JSON.stringify(itemListSchema).replace(/</g, '\\u003c')}</script>
</head>
<body>
<header>
<div class="container">
<div class="header-top">
<div class="logo-section">
<div class="logo-icon">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
<path d="M13 4L4 14H12L11 20L20 10H12L13 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</div>
<h1>Timelesss Updates</h1>
</div>
<div class="header-right">
<div class="header-date">
<span id="current-date">${currentDate}</span>
</div>
<div class="search-wrapper">
<input type="text" class="search-input" id="search-input" placeholder="Search articles…" autocomplete="off" spellcheck="false" />
<span class="search-icon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
<circle cx="11" cy="11" r="7"/>
<line x1="21" y1="21" x2="16.65" y2="16.65"/>
</svg>
</span>
</div>
</div>
</div>
<div class="header-rule">
<span class="header-rule-text">Est. 2026</span>
</div>
</div>
</header>

<div class="container">
${heroHtml}
</div>

<main class="container">
<div id="section-heading-wrapper" ${articles.length > 0 ? '' : 'style="display:none;"'}>
<div class="section-heading">
<h2>All Stories</h2>
</div>
</div>

<div id="articles-grid">${cardsHtml}</div>
<p class="no-results" id="no-results">No articles match your search.</p>
</main>

<footer>
<div class="container">
<div class="footer-inner">
<div class="footer-brand-rule">
<span class="footer-brand-name">Timelesss Updates</span>
</div>
<div class="footer-avatar-wrap">
<img src="/css/yt.png" alt="Adinath Jagtap" class="footer-avatar" />
</div>
<div class="footer-creator-name">Adinath Jagtap</div>
<div class="footer-creator-tag">Creator &amp; Developer</div>
<div class="footer-socials">
<a href="https://www.youtube.com/@iitian_techLab" target="_blank" rel="noopener" class="footer-social-link yt">
<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
YouTube
</a>
<a href="https://github.com/Adinath-Jagtap" target="_blank" rel="noopener" class="footer-social-link gh">
<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"/></svg>
GitHub
</a>
</div>
<div class="footer-copy">&copy; 2026 Timelesss Updates. All rights reserved.</div>
</div>
</div>
</footer>

<script>
// Client-side search functionality (enhances SSR page)
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.article-card');
    const noResults = document.getElementById('no-results');
    const separators = document.querySelectorAll('.date-separator');
    const groups = document.querySelectorAll('.articles-group');
    const heroSection = document.getElementById('hero-section');

    if (heroSection) heroSection.style.display = q ? 'none' : '';

    let visibleCount = 0;
    cards.forEach(card => {
      const title = (card.querySelector('h2')?.textContent || '').toLowerCase();
      const summary = (card.querySelector('.summary')?.textContent || '').toLowerCase();
      const match = !q || title.includes(q) || summary.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    groups.forEach((group, i) => {
      const anyVisible = [...group.querySelectorAll('.article-card')].some(c => c.style.display !== 'none');
      group.style.display = anyVisible ? '' : 'none';
      if (separators[i]) separators[i].style.display = anyVisible ? '' : 'none';
    });

    noResults.style.display = (q && visibleCount === 0) ? 'block' : 'none';
    document.getElementById('section-heading-wrapper').style.display = visibleCount > 0 ? 'block' : 'none';
  });

  // Press '/' to focus search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });
}
</script>
</body>
</html>`;

    return { statusCode: 200, headers, body: html };
  } catch (err) {
    console.error('Homepage SSR error:', err);
    // Fallback: return the static index.html if SSR fails
    return {
      statusCode: 302,
      headers: { Location: '/index.html' },
      body: ''
    };
  } finally {
    if (client) await client.close();
  }
};
