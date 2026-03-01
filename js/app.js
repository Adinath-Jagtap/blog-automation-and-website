let allArticles = [];

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Returns local YYYY-MM-DD string — avoids UTC date shift bug
function localDateKey(dateStr) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatDateLabel(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (isSameDay(d, today)) return 'Today';
    if (isSameDay(d, yesterday)) return 'Yesterday';
    return d.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

// Safe HTML attribute encoding — prevents broken attributes from quotes/apostrophes in titles
function escapeAttr(str) {
    return (str || '')
        .toLowerCase()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function buildHero(articles) {
    if (!articles || articles.length === 0) return;

    const heroSection = document.getElementById('hero-section');
    const heroSkeleton = document.getElementById('hero-skeleton');
    if (heroSkeleton) heroSkeleton.style.display = 'none';

    const featured = articles[0];

    document.getElementById('hero-title').textContent = featured.title;
    document.getElementById('hero-summary').textContent = featured.summary;
    document.getElementById('hero-date').textContent = formatDate(featured.published_date);
    document.getElementById('hero-source').textContent = featured.source_name;

    document.getElementById('hero-read-btn').addEventListener('click', () => {
        window.location.href = 'article.html?id=' + featured._id;
    });
    document.getElementById('hero-title').addEventListener('click', () => {
        window.location.href = 'article.html?id=' + featured._id;
    });

    const secondary = articles.slice(1, 4);
    const secStack = document.getElementById('hero-secondary');
    secStack.innerHTML = secondary.map((a, i) => `
        <div class="hero-secondary-item" onclick="window.location.href='article.html?id=${a._id}'">
            <div class="hero-sec-num">0${i + 2}</div>
            <div class="hero-sec-title">${a.title}</div>
            <div class="hero-sec-date">${formatDate(a.published_date)}</div>
        </div>
    `).join('');

    heroSection.classList.add('visible');
}

function buildCards(articles) {
    const container = document.getElementById('articles-grid');
    const headingWrapper = document.getElementById('section-heading-wrapper');

    if (!articles || articles.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-style:italic;padding:60px 20px;">No articles yet. Check back soon!</p>';
        return;
    }

    headingWrapper.style.display = 'block';

    // Group by LOCAL date key to avoid UTC midnight shift
    const groups = new Map();
    articles.forEach((article, i) => {
        const key = localDateKey(article.published_date);
        if (!groups.has(key)) {
            groups.set(key, { label: formatDateLabel(article.published_date), items: [] });
        }
        groups.get(key).items.push({ ...article, _idx: i });
    });

    // Sort groups newest first
    const sortedGroups = [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));

    let globalIdx = 0;
    const html = sortedGroups.map(([, group]) => {
        const cards = group.items.map(article => {
            const delay = globalIdx * 55;
            globalIdx++;
            return `
            <div class="article-card"
                 onclick="window.location.href='article.html?id=${article._id}'"
                 style="animation-delay:${delay}ms"
                 data-title="${escapeAttr(article.title)}"
                 data-summary="${escapeAttr(article.summary)}">
                <div class="card-index">${String(globalIdx).padStart(2, '0')}</div>
                <h2>${article.title}</h2>
                <p class="summary">${article.summary}</p>
                <div class="article-meta">
                    <span>${formatDate(article.published_date)}</span>
                    <span class="meta-divider">&middot;</span>
                    <span>${article.source_name}</span>
                </div>
            </div>`;
        }).join('');

        return `
        <div class="date-separator">
            <div class="date-separator-line"></div>
            <span class="date-separator-label">${group.label}</span>
            <div class="date-separator-line"></div>
        </div>
        <div class="articles-group">
            ${cards}
        </div>`;
    }).join('');

    container.innerHTML = html;
}

function filterArticles(query) {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll('.article-card');
    const noResults = document.getElementById('no-results');
    const separators = document.querySelectorAll('.date-separator');
    const groups = document.querySelectorAll('.articles-group');

    let visibleCount = 0;

    cards.forEach(card => {
        const title = card.dataset.title || '';
        const summary = card.dataset.summary || '';
        const match = !q || title.includes(q) || summary.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
    });

    // Hide separator + group when all their cards are hidden
    groups.forEach((group, i) => {
        const anyVisible = [...group.querySelectorAll('.article-card')]
            .some(c => c.style.display !== 'none');
        group.style.display = anyVisible ? '' : 'none';
        if (separators[i]) separators[i].style.display = anyVisible ? '' : 'none';
    });

    noResults.style.display = (q && visibleCount === 0) ? 'block' : 'none';
    document.getElementById('section-heading-wrapper').style.display =
        visibleCount > 0 ? 'block' : 'none';
}

async function fetchArticles() {
    try {
        const heroSkeleton = document.getElementById('hero-skeleton');
        if (heroSkeleton) heroSkeleton.style.display = 'grid';

        const response = await fetch(`${API_ENDPOINT}/get-articles`);
        const articles = await response.json();

        document.getElementById('loading').style.display = 'none';
        if (heroSkeleton) heroSkeleton.style.display = 'none';

        allArticles = articles;

        buildHero(articles);
        buildCards(articles);

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const q = e.target.value;
                const heroSection = document.getElementById('hero-section');
                if (heroSection) heroSection.style.display = q.trim() ? 'none' : '';
                filterArticles(q);
            });

            // Press '/' anywhere to focus search
            document.addEventListener('keydown', (e) => {
                if (e.key === '/' && document.activeElement !== searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                }
            });
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        const heroSkeleton = document.getElementById('hero-skeleton');
        if (heroSkeleton) heroSkeleton.style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

fetchArticles();