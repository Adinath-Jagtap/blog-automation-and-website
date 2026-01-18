async function fetchArticles() {
    try {
        const response = await fetch(`${API_ENDPOINT}/get-articles`);
        const articles = await response.json();
        
        document.getElementById('loading').style.display = 'none';
        
        if (articles.length === 0) {
            document.getElementById('articles-grid').innerHTML = '<p style="text-align:center;color:#666666;">No articles yet. Check back soon!</p>';
            return;
        }
        
        const grid = document.getElementById('articles-grid');
        grid.innerHTML = articles.map(article => `
            <div class="article-card" onclick="window.location.href='article.html?id=${article._id}'">
                <h2>${article.title}</h2>
                <p class="summary">${article.summary}</p>
                <div class="article-meta">
                    <span>${new Date(article.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span>${article.source_name}</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

fetchArticles();