from google import genai
import time
import os

def generate_article(headline):
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
    
    prompt = f"""Write a professional, engaging news article based on this headline: "{headline['title']}"

Requirements:
- 400-600 words
- Professional journalistic tone
- Include context and background
- Human-like writing with natural flow
- Clear structure: intro, body, conclusion
- Factual and objective

Write the article now:"""
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        article_content = response.text
        
        summary_prompt = f"Write a compelling 2-sentence summary:\n\n{article_content}"
        summary_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=summary_prompt
        )
        summary = summary_response.text
        
        time.sleep(2)
        
        return {
            'title': headline['title'],
            'summary': summary,
            'content': article_content,
            'source_link': headline['link'],
            'source_name': headline['source'],
            'published_date': headline['published']
        }
    except Exception as e:
        print(f"Error: {e}")
        return None