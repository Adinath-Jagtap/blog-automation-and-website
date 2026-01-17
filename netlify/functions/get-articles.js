const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
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
    
    const articles = await collection
      .find({})
      .sort({ created_at: -1 })
      .limit(50)
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