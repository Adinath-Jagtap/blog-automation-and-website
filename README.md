# 🚀 Timelesss Updates

<div align="center">

![Status](https://img.shields.io/badge/status-live-success?style=for-the-badge)
![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![AI](https://img.shields.io/badge/Gemini_2.5-AI_Powered-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)

**Fully automated AI-powered news platform that aggregates, rewrites, and publishes articles from 15+ global sources**

[Live Demo](https://timelesss-updates.netlify.app/) • [Features](#-features) • [Architecture](#-architecture) • [Setup](#-installation)

</div>

---

## 📰 Overview

Timelesss Updates is an intelligent news aggregation platform that automatically curates content from premium sources like BBC, NYT, TechCrunch, and Reuters. Using Google Gemini 2.5 Flash AI, it transforms raw RSS feeds into professionally written articles, publishes them to a modern web interface, and updates every 2 hours via automated workflows.

### What Makes It Special

- **Zero Manual Intervention**: Fully automated pipeline from aggregation to publication
- **AI Content Transformation**: Raw news feeds converted into polished, readable articles
- **Smart Deduplication**: Intelligent title comparison prevents content repetition
- **Production Ready**: Enterprise-grade stack with MongoDB Atlas and Netlify deployment
- **Modern Interface**: Dark-themed responsive design with smooth animations

---

## ✨ Features

### 🤖 Automation Engine
- **Multi-Source Aggregation**: Scrapes 15+ RSS feeds including BBC, NYT, TechCrunch, Reuters, Reddit
- **Scheduled Execution**: GitHub Actions workflow runs every 2 hours automatically
- **Intelligent Filtering**: 24-hour time window for fresh content only
- **Duplicate Prevention**: Advanced title comparison algorithm

### 🧠 AI Content Generation
- **Gemini 2.5 Flash Integration**: State-of-the-art language model for content rewriting
- **Professional Tone**: Converts raw feeds into publication-ready articles
- **Batch Processing**: Handles 10 articles per cycle with rate limiting
- **SEO Optimization**: AI-generated summaries and metadata

### 🌐 Web Platform
- **Serverless Architecture**: Netlify Functions for scalable API endpoints
- **Modern UI/UX**: Custom dark theme with gradient accents
- **Responsive Design**: Mobile-first approach, works on all devices
- **Fast Performance**: < 2s homepage load, SVG-only graphics
- **SEO Ready**: Meta tags, Open Graph, Twitter Cards included

### 💾 Database Layer
- **MongoDB Atlas**: Cloud-based NoSQL storage
- **Structured Schema**: Organized article metadata with timestamps
- **Efficient Queries**: Optimized for fast retrieval and pagination
- **Persistent Storage**: Reliable historical article archive

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Every 2h)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Fetch RSS Feeds → 2. Deduplicate → 3. AI Generate│   │
│  │  4. Store to MongoDB → 5. Trigger Deployment          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  MongoDB Atlas   │
                    │  (Article Store) │
                    └──────────────────┘
                              ↓
              ┌───────────────────────────────┐
              │     Netlify Deployment        │
              │  ┌─────────────────────────┐  │
              │  │  Static Site (HTML/CSS) │  │
              │  └─────────────────────────┘  │
              │  ┌─────────────────────────┐  │
              │  │  Serverless Functions   │  │
              │  │  - get-articles.js      │  │
              │  │  - get-article.js       │  │
              │  └─────────────────────────┘  │
              └───────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │   End Users      │
                    │  (Web Browsers)  │
                    └──────────────────┘
```

---

## 📂 Project Structure

```
blog-automation-and-website/
│
├── .github/
│   └── workflows/
│       └── automation.yml          # GitHub Actions scheduler
│
├── automation/
│   └── src/
│       ├── compare_deduplicate.py  # Deduplication logic
│       ├── config.py               # RSS sources & settings
│       ├── fetch_news.py           # RSS feed fetcher
│       ├── generate_content.py     # Gemini AI integration
│       ├── main.py                 # Pipeline orchestrator
│       └── store_database.py       # MongoDB handler
│   └── requirements.txt            # Python dependencies
│
├── netlify/
│   └── functions/
│       ├── get-article.js          # Single article API
│       └── get-articles.js         # Article list API
│
├── css/
│   ├── logo.png                    # Brand logo
│   └── style.css                   # Main stylesheet
│
├── js/
│   ├── app.js                      # Homepage logic
│   ├── article.js                  # Article page logic
│   └── config.js                   # API configuration
│
├── article.html                    # Article detail template
├── index.html                      # Homepage
├── netlify.toml                    # Netlify config
├── package.json                    # Node dependencies
└── README.md
```

---

## 🛠️ Technology Stack

<table>
<tr>
<td>

### Backend Automation
- **Python 3.10** - Automation scripts
- **Google Gemini 2.5 Flash** - AI generation
- **PyMongo** - Database driver
- **Feedparser** - RSS parsing
- **GitHub Actions** - CI/CD scheduler

</td>
<td>

### Frontend & API
- **HTML5/CSS3** - Modern UI
- **Vanilla JavaScript** - No frameworks
- **Netlify Functions** - Serverless APIs
- **Node.js 16+** - Function runtime
- **MongoDB Atlas** - Cloud database

</td>
</tr>
</table>

---

## 🚀 Installation

### Prerequisites

```bash
# Required
✓ Python 3.10 or higher
✓ Node.js 16 or higher
✓ MongoDB Atlas account
✓ Google Gemini API key
✓ Git
```

### 1. Clone Repository

```bash
git clone https://github.com/Adinath-Jagtap/blog-automation-and-website.git
cd blog-automation-and-website
```

### 2. Backend Setup

```bash
cd automation
pip install -r requirements.txt
```

Create `.env` file in `automation/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

### 3. Frontend Setup

```bash
npm install
```

### 4. Local Testing

```bash
# Run automation pipeline
cd automation/src
python main.py

# Test Netlify functions locally
netlify dev
```

### 5. Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

**Set environment variables in Netlify Dashboard:**
- `MONGODB_URI` - Your MongoDB connection string

---

## ⚙️ Configuration

### Modify RSS Sources

Edit `automation/src/config.py`:

```python
NEWS_SOURCES = [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    # Add your sources here
]

TIMEFRAME_HOURS = 24  # Fetch news from last 24 hours
```

### Customize Automation Schedule

Edit `.github/workflows/automation.yml`:

```yaml
schedule:
  - cron: '0 */2 * * *'  # Every 2 hours (change as needed)
```

### Styling & Branding

- **Logo**: Replace `css/logo.png` with your branding
- **Colors**: Modify CSS variables in `css/style.css`
- **Layout**: Edit `index.html` and `article.html`

---

## 🔄 Automation Workflow

<div align="center">

```mermaid
graph LR
    A[RSS Feeds] -->|Fetch| B[Parser]
    B -->|Filter| C[Deduplicator]
    C -->|Unique Articles| D[Gemini AI]
    D -->|Generated Content| E[MongoDB]
    E -->|API| F[Website]
    
    style A fill:#1e293b
    style D fill:#8e75b2
    style E fill:#47a248
    style F fill:#00c7b7
```

</div>

1. **Fetch** - Collects articles from 15+ RSS sources
2. **Filter** - Removes outdated content (>24h old)
3. **Deduplicate** - Compares against existing database entries
4. **Generate** - AI rewrites 10 most recent unique articles
5. **Store** - Saves to MongoDB with metadata
6. **Deploy** - Website auto-updates via Netlify Functions

---

## 📊 Database Schema

```javascript
{
  "_id": ObjectId("..."),
  "title": "Article headline",
  "summary": "Brief description for preview",
  "content": "Full AI-generated article content",
  "source_link": "https://original-article-url.com",
  "source_name": "BBC News",
  "published_date": "2026-01-21T10:30:00Z",
  "created_at": "2026-01-21T12:00:00Z",
  "slug": "article-headline-slug"
}
```

---

## 🔐 Security & Best Practices

- ✅ API keys stored as environment variables
- ✅ No sensitive data committed to repository
- ✅ MongoDB connection uses SSL/TLS
- ✅ CORS properly configured for API endpoints
- ✅ Input validation on all user-facing endpoints
- ✅ Rate limiting on Gemini API calls

---

## 📈 Performance Metrics

| Metric | Value |
|--------|-------|
| Homepage Load Time | < 2 seconds |
| Article Generation | ~10s per article |
| Database Query Speed | < 500ms |
| API Response Time | < 300ms |
| Automation Runtime | ~2-3 minutes |

---

## 🐛 Troubleshooting

<details>
<summary><b>Automation not running</b></summary>

- Check GitHub Actions permissions in repository settings
- Verify environment variables are set in GitHub Secrets
- Review workflow logs in Actions tab
</details>

<details>
<summary><b>MongoDB connection errors</b></summary>

- Verify `MONGO_URI` environment variable
- Check IP whitelist in MongoDB Atlas (add `0.0.0.0/0` for testing)
- Ensure database user has read/write permissions
</details>

<details>
<summary><b>Gemini API failures</b></summary>

- Confirm `GEMINI_API_KEY` is valid and active
- Check API quota limits in Google AI Studio
- Verify network connectivity to Google APIs
</details>

<details>
<summary><b>Articles not displaying on website</b></summary>

- Check Netlify Function logs in dashboard
- Verify MongoDB URI in Netlify environment variables
- Test API endpoints directly: `/api/get-articles`
</details>

---

## 🎯 Roadmap

- [ ] Category-based article filtering
- [ ] Full-text search functionality
- [ ] User authentication for admin panel
- [ ] Newsletter email subscriptions
- [ ] Social media auto-posting
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Comment system integration

---

## 🤝 Contributing

Contributions make this project better! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- Google Gemini AI for powerful content generation
- MongoDB Atlas for reliable cloud database
- Netlify for seamless deployment and hosting
- RSS feed providers for quality news sources
- Open-source community for amazing tools

---

<div align="center">

**[View Live Site](https://timelesss-updates.netlify.app/)** • **[Report Bug](https://github.com/Adinath-Jagtap/blog-automation-and-website/issues)** • **[Request Feature](https://github.com/Adinath-Jagtap/blog-automation-and-website/issues)**

Made with ❤️ using AI and automation

*Last Updated: January 2026*

</div>
