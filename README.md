# Timelesss Updates

A fully automated news aggregation and content generation system that curates, writes, and publishes articles from multiple RSS feeds using AI.

![GitHub](https://img.shields.io/badge/status-active-success)
![Netlify](https://img.shields.io/badge/deployed-Netlify-blue)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green)
![AI-Powered](https://img.shields.io/badge/AI-Gemini_2.5-orange)

## 🌐 Live Demo
**Website:** [https://timelesss-updates.netlify.app/](https://timelesss-updates.netlify.app/)

## ✨ Features

- **Automated News Aggregation**: Fetches articles from 15+ RSS sources (BBC, NYT, TechCrunch, Reuters, Reddit, etc.)
- **AI Content Generation**: Uses Google Gemini 2.5 Flash to rewrite news into professional articles
- **Smart Deduplication**: Prevents duplicate articles using title comparison
- **Scheduled Automation**: Runs every 2 hours via GitHub Actions
- **Modern Static Website**: Dark-themed, responsive design with smooth animations
- **SEO Optimized**: Proper meta tags, Open Graph, and Twitter Cards
- **Database Backend**: MongoDB for persistent article storage

## 📁 Project Structure

```
blog-automation-and-website/
│
├── automation/                    # Python automation scripts
│   ├── compare_deduplicate.py    # Deduplication logic
│   ├── config.py                 # Configuration & RSS sources
│   ├── fetch_news.py             # RSS feed fetcher
│   ├── generate_content.py       # Gemini AI article generator
│   ├── main.py                   # Main automation orchestrator
│   ├── requirements.txt          # Python dependencies
│   ├── store_database.py         # MongoDB storage handler
│   └── automation.yml            # GitHub Actions workflow
│
├── netlify/functions/            # Serverless backend
│   ├── get-article.js           # Single article API
│   └── get-articles.js          # Article list API
│
├── index.html                    # Homepage
├── article.html                  # Individual article page
├── style.css                     # Main stylesheet
│
├── js/                          # Frontend JavaScript
│   ├── app.js                   # Homepage functionality
│   ├── article.js               # Article page functionality
│   └── config.js                # API endpoint configuration
│
├── netlify.toml                 # Netlify deployment configuration
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## 🔧 Technology Stack

### Backend Automation
- **Python 3.10** - Core automation language
- **Google Gemini AI 2.5 Flash** - Article generation
- **PyMongo** - MongoDB interaction
- **Feedparser** - RSS feed parsing
- **GitHub Actions** - Scheduled automation

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom dark theme with responsive design
- **Vanilla JavaScript** - No frameworks, minimal dependencies
- **Netlify Functions** - Serverless API endpoints

### Database & Deployment
- **MongoDB Atlas** - Cloud database
- **Netlify** - Static hosting with serverless functions
- **Node.js** - Runtime for Netlify functions

## 🚀 Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 16+
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone https://github.com/Adinath-Jagtap/blog-automation-and-website.git
cd blog-automation-and-website
```

### 2. Backend Automation Setup
```bash
cd automation
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the automation directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=your_mongodb_connection_string_here
```

### 4. Netlify Functions Setup
```bash
npm install
```

### 5. Run Automation Locally
```bash
cd automation
python main.py
```

## ⚙️ Configuration

### RSS Sources
Edit `automation/config.py` to modify:
- `NEWS_SOURCES`: Add/remove RSS feed URLs
- `TIMEFRAME_HOURS`: Time window for news (default: 24 hours)
- `DB_NAME` & `COLLECTION_NAME`: MongoDB settings

### Website Styling
- Modify `style.css` for design changes
- Update `index.html` and `article.html` for structural changes
- Edit `js/app.js` and `js/article.js` for frontend logic

## 🔄 Automation Workflow

1. **Fetch**: Collects news from RSS feeds (runs every 2 hours)
2. **Deduplicate**: Compares against existing articles in database
3. **Generate**: Uses Gemini AI to rewrite 10 most recent unique articles
4. **Store**: Saves generated articles to MongoDB
5. **Display**: Website fetches and displays articles via Netlify Functions

## 🌍 Deployment

### Automated Deployment
The system is configured for automatic deployment via:
- **GitHub Actions**: Runs automation every 2 hours
- **Netlify**: Auto-deploys on git push to main branch

### Manual Deployment
1. Push changes to GitHub
2. Netlify automatically deploys from the main branch
3. Set environment variables in Netlify dashboard:
   - `MONGODB_URI`
   - `GEMINI_API_KEY` (for local automation only)

## 📊 Database Schema

Articles are stored with the following structure:
```javascript
{
  "_id": ObjectId,
  "title": String,
  "summary": String,
  "content": String,
  "source_link": String,
  "source_name": String,
  "published_date": ISOString,
  "created_at": ISOString,
  "slug": String
}
```

## 🔐 Security Notes

- API keys are stored as environment variables
- No sensitive data in source code
- CORS properly configured for Netlify functions
- MongoDB connection uses SSL

## 🛠️ Troubleshooting

### Common Issues

1. **"Error fetching from RSS feed"**
   - Check internet connection
   - Verify RSS URLs in config.py are active

2. **"MongoDB connection failed"**
   - Verify MONGO_URI environment variable
   - Check IP whitelist in MongoDB Atlas

3. **"Gemini API error"**
   - Verify GEMINI_API_KEY is valid
   - Check API usage limits

4. **Website not loading articles**
   - Check Netlify function logs
   - Verify MongoDB connection in functions

## 📈 Performance

- **Homepage Load**: < 2 seconds
- **Article Generation**: ~10 seconds per article (with rate limiting)
- **Database Queries**: < 500ms
- **Image Optimization**: SVG-only for fast loading

## 🔮 Future Enhancements

- [ ] User authentication for admin panel
- [ ] Article categories/tags
- [ ] Search functionality
- [ ] Newsletter subscription
- [ ] Social media sharing integration
- [ ] Analytics dashboard
- [ ] Multi-language support

## 📝 License

This project is open-source. Feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## 📧 Contact

**Repository:** [github.com/Adinath-Jagtap/blog-automation-and-website](https://github.com/Adinath-Jagtap/blog-automation-and-website)  
**Live Site:** [timelesss-updates.netlify.app](https://timelesss-updates.netlify.app/)

---

**Note**: This project is for educational and demonstration purposes. Ensure compliance with terms of service for RSS feeds and AI APIs when deploying.

*Last Updated: January 2026*
