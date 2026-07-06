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

function renderArticleBody(content = '') {
  // If content already contains HTML tags (h2, h3, p, ul, li), render as-is with safety
  if (/<(h2|h3|p|ul|li|strong|em)\b/i.test(content)) {
    // Strip dangerous tags but allow structural ones
    return content
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');
  }
  // Fallback: plain text → paragraphs
  return content
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join('\n');
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'text/html; charset=UTF-8',
    'Cache-Control': 'public, max-age=300, s-maxage=600'
  };
  const params = event.queryStringParameters || {};

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

    // Fetch 4 related articles for internal linking
    const relatedArticles = await collection
      .find({ _id: { $ne: article._id } })
      .project({ title: 1, slug: 1, summary: 1, published_date: 1, source_name: 1, reading_time: 1 })
      .sort({ created_at: -1 })
      .limit(4)
      .toArray();

    const title = escapeHtml(article.title);
    const description = escapeHtml(truncate(article.meta_description || article.summary));
    const slugPath = encodeURIComponent(article.slug);
    const canonicalUrl = `${SITE_URL}/article/${slugPath}`;
    const publishedISO = new Date(article.published_date).toISOString();
    const modifiedISO = new Date(article.created_at || article.published_date).toISOString();
    const dateLabel = new Date(article.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const readingTime = article.reading_time || 3;
    const tags = article.tags || [];
    const faqs = article.faqs || [];

    const bodyHtml = renderArticleBody(article.content);

    // ─── JSON-LD: NewsArticle ───
    const newsArticleSchema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.meta_description || article.summary,
      image: [`${SITE_URL}/css/og-image.png`],
      datePublished: publishedISO,
      dateModified: modifiedISO,
      wordCount: article.word_count || 0,
      author: { '@type': 'Organization', name: 'Timelesss Updates', url: SITE_URL },
      publisher: {
        '@type': 'Organization',
        name: 'Timelesss Updates',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/css/logo.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
      keywords: tags.join(', ')
    };

    // ─── JSON-LD: BreadcrumbList ───
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: article.title,
          item: canonicalUrl
        }
      ]
    };

    // ─── JSON-LD: FAQPage (if FAQs exist) ───
    let faqSchemaTag = '';
    if (faqs.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      };
      faqSchemaTag = `<script type="application/ld+json">${JSON.stringify(faqSchema).replace(/</g, '\\u003c')}</script>`;
    }

    // ─── Tags meta ───
    const tagsMeta = tags.map(t => `<meta property="article:tag" content="${escapeHtml(t)}">`).join('\n');

    // ─── Related articles HTML ───
    let relatedHtml = '';
    if (relatedArticles.length > 0) {
      const relatedCards = relatedArticles.map(ra => {
        const raDate = new Date(ra.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const raSlug = encodeURIComponent(ra.slug);
        return `
        <a href="/article/${raSlug}" class="related-card">
          <h3>${escapeHtml(ra.title)}</h3>
          <p class="related-summary">${escapeHtml(truncate(ra.summary || '', 100))}</p>
          <div class="related-meta">
            <span>${raDate}</span>
            <span class="meta-divider">·</span>
            <span>${ra.reading_time || 3} min read</span>
          </div>
        </a>`;
      }).join('');

      relatedHtml = `
      <div class="related-section">
        <div class="related-heading">
          <div class="related-heading-line"></div>
          <span class="related-heading-label">More Stories</span>
          <div class="related-heading-line"></div>
        </div>
        <div class="related-grid">
          ${relatedCards}
        </div>
      </div>`;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} - Timelesss Updates</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${escapeHtml(tags.join(', '))}">
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
<meta property="og:site_name" content="Timelesss Updates">
<meta property="article:published_time" content="${publishedISO}">
<meta property="article:modified_time" content="${modifiedISO}">
<meta property="article:section" content="News">
${tagsMeta}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${SITE_URL}/css/og-image.png">
<link rel="stylesheet" href="/css/style.css">
<script type="application/ld+json">${JSON.stringify(newsArticleSchema).replace(/</g, '\\u003c')}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c')}</script>
${faqSchemaTag}
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

<nav class="breadcrumb-nav container" aria-label="Breadcrumb">
  <ol class="breadcrumb-list">
    <li><a href="/">Home</a></li>
    <li aria-current="page">${title}</li>
  </ol>
</nav>

<article class="container article-page" itemscope itemtype="https://schema.org/NewsArticle">
<div id="article-content">
<h1 id="article-title" itemprop="headline">${title}</h1>
<div class="article-meta">
<span class="meta-item" itemprop="datePublished" content="${publishedISO}">${dateLabel}</span>
<span class="meta-divider">|</span>
<span class="meta-item" itemprop="publisher" itemscope itemtype="https://schema.org/Organization"><span itemprop="name">${escapeHtml(article.source_name)}</span></span>
<span class="meta-divider">|</span>
<span class="meta-item reading-time-badge">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
${readingTime} min read
</span>
</div>
<div class="article-divider"></div>
<div id="article-body" itemprop="articleBody">${bodyHtml}</div>

<div class="source-credit">
  <div class="source-credit-inner">
    <svg class="source-credit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
    <div class="source-credit-text">
      <span class="source-credit-label">Original reporting</span>
      <a href="${escapeHtml(article.source_link)}" target="_blank" rel="noopener nofollow" class="source-credit-link">${escapeHtml(article.source_name)}</a>
    </div>
  </div>
</div>

<div class="article-end-mark">■</div>

${relatedHtml}

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
