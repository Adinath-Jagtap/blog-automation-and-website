from google import genai
import time
import os
import re

def generate_article(headline):
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
    
    prompt = f"""Write a professional news article about: "{headline['title']}"

CRITICAL RULES:
- Write in plain text ONLY - absolutely NO markdown formatting
- NO hashtags (#), NO asterisks (**), NO special characters for formatting
- Write naturally like a human journalist would
- Use proper paragraphs separated by blank lines
- 400-600 words
- Professional, conversational tone
- Include context and analysis
- Make it engaging and easy to read

Write the complete article now as plain text:"""
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        article_content = response.text
        
        # Remove any markdown artifacts
        article_content = re.sub(r'\*\*|\*|__|_', '', article_content)
        article_content = re.sub(r'^#+\s+', '', article_content, flags=re.MULTILINE)
        article_content = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', article_content)
        
        summary_prompt = f"""Write a compelling 2-sentence summary of this article.
        
NO markdown, NO special formatting, just plain natural text:

{article_content}"""
        
        summary_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=summary_prompt
        )
        summary = summary_response.text
        summary = re.sub(r'\*\*|\*|__|_', '', summary)
        
        time.sleep(2)
        
        return {
            'title': headline['title'],
            'summary': summary.strip(),
            'content': article_content.strip(),
            'source_link': headline['link'],
            'source_name': headline['source'],
            'published_date': headline['published']
        }
    except Exception as e:
        print(f"Error: {e}")
        return None