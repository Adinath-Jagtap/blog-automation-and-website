const { MongoClient, ObjectId } = require('mongodb');

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

function truncate(str = '', max = 155) {
  const clean = str.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'text/html; charset=UTF-8' };
  const params = event.queryStringParameters || {};

  // Extract slug from query params, or fall back to parsing the original URL path
  // Netlify rewrites don't always pass named params in query strings reliably
  let slug = params.slug;
  const id = params.id;

  if (!slug && !id && event.path) {
    const pathMatch = event.path.match(/\/article\/(.+)/);
    if (pathMatch) {
      slug = decodeURIComponent(pathMatch[1]);
    }
  }

  if (!slug && !id) {
    return { statusCode: 400, headers, body: '<h1>Article not specified</h1>' };
  }

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const collection = client.db('blog_automation').collection('articles');

    const query = slug ? { slug } : { _id: new ObjectId(id) };
    const article = await collection.findOne(query);

    if (!article) {
      return { statusCode: 404, headers, body: '<h1>Article not found</h1>' };
    }

    const title = escapeHtml(article.title);
    const description = escapeHtml(truncate(article.summary));
    const slugPath = encodeURIComponent(article.slug);
    const canonicalUrl = `${SITE_URL}/article/${slugPath}`;
    const publishedISO = new Date(article.published_date).toISOString();
    const modifiedISO = new Date(article.created_at || article.published_date).toISOString();
    const dateLabel = new Date(article.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const keywords = escapeHtml(`${article.title}, news, latest update, breaking news, timelesss updates`);

    const bodyHtml = (article.content || '')
      .split('\n')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p>${escapeHtml(p)}</p>`)
      .join('\n');

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.summary,
      image: [`${SITE_URL}/css/og-image.png`],
      datePublished: publishedISO,
      dateModified: modifiedISO,
      author: { '@type': 'Organization', name: 'Timelesss Updates' },
      publisher: {
        '@type': 'Organization',
        name: 'Timelesss Updates',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/css/logo.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl }
    };
    const jsonLdSafe = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} - Timelesss Updates</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<link rel="canonical" href="${canonicalUrl}">
<link rel="icon" type="image/png" href="${SITE_URL}/css/logo.png">
<link rel="apple-touch-icon" href="${SITE_URL}/css/logo.png">
<meta name="google-adsense-account" content="ca-pub-2200531077153999">
<meta name="google-site-verification" content="xLPntKv98Ss_Zt_0afEDX_MUaCaorNkIqSC4PLkT0xY" />
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2200531077153999"
 crossorigin="anonymous"></script>
<meta property="og:type" content="article">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${SITE_URL}/css/og-image.png">
<meta property="article:published_time" content="${publishedISO}">
<meta property="article:modified_time" content="${modifiedISO}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${SITE_URL}/css/og-image.png">
<link rel="stylesheet" href="/css/style.css">
<script type="application/ld+json">${jsonLdSafe}</script>
</head>
<body>
<header class="article-header">
<div class="container">
<div class="header-content">
<a href="/" class="logo-section">
<div class="logo-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M13 4L4 14H12L11 20L20 10H12L13 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<h1>Timelesss Updates</h1>
</a>
</div>
<div class="header-divider"></div>
</div>
</header>
<article class="container article-page">
<div id="article-content">
<h1 id="article-title">${title}</h1>
<div class="article-meta">
<span class="meta-item">${dateLabel}</span>
<span class="meta-divider">|</span>
<span class="meta-item">${escapeHtml(article.source_name)}</span>
</div>
<div class="article-divider"></div>
<div id="article-body">${bodyHtml}</div>
<p class="source-credit"><a href="${escapeHtml(article.source_link)}" target="_blank" rel="noopener nofollow">Original reporting: ${escapeHtml(article.source_name)}</a></p>
<div class="article-end-mark">■</div>
<a href="/" class="back-link">
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
Return to Homepage
</a>
</div>
</article>
<footer>
<div class="container">
<div class="footer-inner">
<div class="footer-brand-rule"><span class="footer-brand-name">Timelesss Updates</span></div>
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
</body>
</html>`;

    return { statusCode: 200, headers, body: html };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: '<h1>Server error</h1>' };
  } finally {
    if (client) await client.close();
  }
};
