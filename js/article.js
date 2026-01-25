const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');

function updateMetaTags(title, description) {
    const currentUrl = window.location.href;
    
    document.title = title + ' - Timelesss Updates';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', description);
    }
    
    // Add this block for keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        const keywords = `${title}, news, latest update, breaking news, timelesss updates`;
        metaKeywords.setAttribute('content', keywords);
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', title);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.setAttribute('content', description);
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
        ogUrl.setAttribute('content', currentUrl);
    }
    
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
        twitterTitle.setAttribute('content', title);
    }
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
        twitterDescription.setAttribute('content', description);
    }
    
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) {
        twitterUrl.setAttribute('content', currentUrl);
    }
}

if (!articleId) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
} else {
    fetch(`/.netlify/functions/get-article?id=${articleId}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            
            updateMetaTags(data.title, data.summary);
            
            document.getElementById('loading').style.display = 'none';
            document.getElementById('article-content').style.display = 'block';
            
            document.getElementById('article-title').textContent = data.title;
            document.getElementById('article-date').textContent = new Date(data.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('article-source').textContent = data.source_name;
            
            const paragraphs = data.content
                .split('\n')
                .filter(p => p.trim().length > 0)
                .map(p => `<p>${p.trim()}</p>`)
                .join('');
            
            document.getElementById('article-body').innerHTML = paragraphs;
        })
        .catch(err => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
        });
}