const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=120, s-maxage=300'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let client;
  
  try {
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('blog_automation');
    const collection = db.collection('articles');
    
    // Project only the fields needed for listing — exclude heavy content field for faster load (Core Web Vitals)
    const articles = await collection
      .find({})
      .project({
        title: 1,
        summary: 1,
        slug: 1,
        source_name: 1,
        published_date: 1,
        created_at: 1,
        tags: 1,
        reading_time: 1
      })
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(articles)
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch articles' })
    };
    
  } finally {
    if (client) {
      await client.close();
    }
  }
};