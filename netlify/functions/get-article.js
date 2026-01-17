const { MongoClient, ObjectId } = require('mongodb');

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

  const id = event.queryStringParameters.id;

  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Article ID required' })
    };
  }

  let client;
  
  try {
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('blog_automation');
    const collection = db.collection('articles');
    
    const article = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!article) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Article not found' })
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(article)
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch article' })
    };
    
  } finally {
    if (client) {
      await client.close();
    }
  }
};