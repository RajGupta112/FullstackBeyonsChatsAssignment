# BeyondChats Article Optimizer 🚀

A full-stack application that scrapes website content and uses AI (Gemini) to transform it into professional, SEO-optimized articles.

## 🔗 Live Links
- **Frontend (Vercel):** 
- **Backend (Render):** 

## 🏗️ Architecture & Data Flow
The system follows a three-phase architecture:
1. **Scraping Engine:** Extracts raw data from target URLs.
2. **AI Logic:** Enhances content using Google Search context and Google Gemini AI.
3. **Dashboard:** A React-based UI to compare Original vs. Optimized content.

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js (v22.11.0 or higher)
- A Gemini AI API Key

### Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_key_here
   PORT=5000

   Frontend Setup
Navigate to the frontend folder: cd frontend

Install dependencies: npm install

Start the dev server: npm run dev

📋 Features
Side-by-side comparison of original and AI-enhanced text.

Responsive design using Tailwind CSS v4.

Automated pipeline for scraping and rewriting.

🧑‍💻 Development Journey
I followed a phased approach:

Phase 1: Built the core scraper for BeyondChats.

Phase 2: Integrated Gemini AI for content rewriting.

Phase 3: Developed the React Dashboard for final presentation.