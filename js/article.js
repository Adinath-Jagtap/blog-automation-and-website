const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');

function updateMetaTags(title, description) {
    const currentUrl = window.location.href;
    
    document.title = title + ' - Timelesss Updates';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', description);
    }
    
    document.querySelector('meta[property="og:title"]').setAttribute('content', title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', description);
    document.querySelector('meta[property="og:url"]').setAttribute('content', currentUrl);
    
    document.querySelector('meta[property="twitter:title"]').setAttribute('content', title);
    document.querySelector('meta[property="twitter:description"]').setAttribute('content', description);
    document.querySelector('meta[property="twitter:url"]').setAttribute('content', currentUrl);
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