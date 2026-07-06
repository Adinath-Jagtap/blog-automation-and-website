from google import genai
import time
import os
import re
import json

def generate_article(headline):
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
    
    # ─── MAIN ARTICLE PROMPT ───
    article_prompt = f"""You are an expert journalist and SEO specialist. Write a comprehensive, in-depth news article about: "{headline['title']}"

CONTENT REQUIREMENTS:
- Write 1200-2000 words of substantive, analytical content
- Include context: why this matters, background, implications, what happens next
- Add unique analysis and expert perspective — don't just restate the headline
- Write in a professional yet engaging, conversational tone like a top-tier journalist
- Make it genuinely informative — a reader should learn something new

STRUCTURE REQUIREMENTS (use HTML tags):
- Start with a compelling opening paragraph (no heading before it)
- Use <h2> tags for 3-5 major section headings throughout the article
- Use <h3> tags for sub-sections where appropriate
- Use <p> tags for all paragraphs
- Include a section with <h2>Key Takeaways</h2> containing 3-5 bullet points using <ul><li> tags
- End with a <h2>Frequently Asked Questions</h2> section with 3-5 Q&A pairs
- For FAQ, format each as: <h3>Question here?</h3> followed by <p>Answer here</p>

CRITICAL FORMATTING RULES:
- Use ONLY these HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- NO markdown formatting (no #, no **, no *)
- NO links or anchor tags
- Every paragraph MUST be wrapped in <p> tags
- Every heading MUST use proper <h2> or <h3> tags

Write the complete article now:"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=article_prompt
        )
        article_content = response.text
        
        # Clean up any markdown that leaked through
        article_content = re.sub(r'^#+\s+', '', article_content, flags=re.MULTILINE)
        article_content = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', article_content)
        # Remove markdown bold/italic but preserve HTML tags
        article_content = re.sub(r'(?<!\<)\*\*([^*]+)\*\*(?!\>)', r'<strong>\1</strong>', article_content)
        article_content = re.sub(r'(?<!\<)\*([^*]+)\*(?!\>)', r'<em>\1</em>', article_content)
        
        time.sleep(1)
        
        # ─── META DESCRIPTION PROMPT ───
        meta_prompt = f"""Write a compelling SEO meta description (150-155 characters) for this article.
        
The article title is: "{headline['title']}"

Rules:
- Exactly 150-155 characters
- Include the main keyword naturally
- Make it click-worthy and informative
- NO quotes around the description
- Plain text only, no HTML

Write ONLY the meta description, nothing else:"""

        meta_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=meta_prompt
        )
        meta_description = meta_response.text.strip().strip('"').strip("'")
        
        time.sleep(1)
        
        # ─── FAQ EXTRACTION PROMPT ───
        faq_prompt = f"""Extract the FAQ section from this article as a JSON array. Each item should have "question" and "answer" fields.

Article content:
{article_content}

Return ONLY a valid JSON array like this (no markdown, no code fences):
[{{"question": "...", "answer": "..."}}, {{"question": "...", "answer": "..."}}]"""

        faq_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=faq_prompt
        )
        
        faq_text = faq_response.text.strip()
        # Remove code fences if present
        faq_text = re.sub(r'^```(?:json)?\s*', '', faq_text)
        faq_text = re.sub(r'\s*```$', '', faq_text)
        
        try:
            faqs = json.loads(faq_text)
        except json.JSONDecodeError:
            faqs = []
        
        time.sleep(1)
        
        # ─── TAGS / KEYWORDS PROMPT ───
        tags_prompt = f"""Generate 5-8 SEO keyword tags for this article about: "{headline['title']}"

Rules:
- Each tag should be 1-3 words
- Include the main topic, related concepts, and trending terms
- Return as a JSON array of strings
- NO markdown, NO code fences

Return ONLY a valid JSON array like: ["tag1", "tag2", "tag3"]"""

        tags_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=tags_prompt
        )
        
        tags_text = tags_response.text.strip()
        tags_text = re.sub(r'^```(?:json)?\s*', '', tags_text)
        tags_text = re.sub(r'\s*```$', '', tags_text)
        
        try:
            tags = json.loads(tags_text)
        except json.JSONDecodeError:
            tags = []
        
        time.sleep(1)
        
        # ─── SUMMARY PROMPT ───
        summary_prompt = f"""Write a compelling 2-sentence summary of this article.
        
NO markdown, NO special formatting, just plain natural text:

{article_content[:2000]}"""
        
        summary_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=summary_prompt
        )
        summary = summary_response.text
        summary = re.sub(r'\*\*|\*|__|_', '', summary)
        
        # Calculate reading time (average 200 words per minute)
        word_count = len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', article_content)))
        reading_time = max(1, round(word_count / 200))
        
        time.sleep(1)
        
        return {
            'title': headline['title'],
            'summary': summary.strip(),
            'content': article_content.strip(),
            'source_link': headline['link'],
            'source_name': headline['source'],
            'published_date': headline['published'],
            'meta_description': meta_description[:160],
            'faqs': faqs,
            'tags': tags,
            'reading_time': reading_time,
            'word_count': word_count
        }
    except Exception as e:
        print(f"Error: {e}")
        return None