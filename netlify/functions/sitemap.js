const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const SITE_URL = 'https://timelesss-updates.netlify.app';

exports.handler = async () => {
  const headers = { 'Content-Type': 'application/xml; charset=UTF-8' };
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const articles = await client.db('blog_automation').collection('articles')
      .find({}, { projection: { slug: 1, created_at: 1 } })
      .sort({ created_at: -1 })
      .limit(1000)
      .toArray();

    // Determine the most recent article date for homepage lastmod
    const latestDate = articles.length > 0
      ? new Date(articles[0].created_at).toISOString()
      : new Date().toISOString();

    const urls = articles.map(a => `
  <url>
    <loc>${SITE_URL}/article/${encodeURIComponent(a.slug)}</loc>
    <lastmod>${new Date(a.created_at).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${latestDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>${urls}
</urlset>`;

    return { statusCode: 200, headers, body: xml };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: '<error/>' };
  } finally {
    if (client) await client.close();
  }
};
