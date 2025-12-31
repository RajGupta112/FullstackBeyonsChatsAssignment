import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import * as cheerio from 'cheerio';
import { extract } from '@extractus/article-extractor';
import prisma from '../config/db.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const runAIAutomation = async () => {
    // 1. Fetch articles from DB that need AI enhancement
    const articles = await prisma.article.findMany({
        where: { contentUpdated: null },
        take: 3 
    });

    const results = [];

    for (const article of articles) {
        console.log(`\n🚀 Starting Research for: "${article.title}"`);

        let externalScrapedData = "";
        let references = [];

        try {
            // 2. SEARCH GOOGLE (Targeting high-authority sites to bypass generic blocks)
            const searchQuery = `${article.title} site:medium.com OR site:ibm.com OR site:forbes.com`;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=5`;

            const { data: searchHtml } = await axios.get(searchUrl, {
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
                }
            });

            const $ = cheerio.load(searchHtml);
            const foundLinks = [];

            // Targeted Link Extraction
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (!href) return;

                let actualUrl = "";
                if (href.includes('/url?q=')) {
                    actualUrl = decodeURIComponent(href.split('/url?q=')[1].split('&')[0]);
                } else if (href.startsWith('http')) {
                    actualUrl = href;
                }

                // Filter for quality and avoid loops
                if (
                    actualUrl.startsWith('http') && 
                    !actualUrl.includes('google.com') && 
                    !actualUrl.includes('beyondchats.com') &&
                    (actualUrl.includes('medium.com') || actualUrl.includes('ibm.com') || actualUrl.includes('forbes.com'))
                ) {
                    foundLinks.push(actualUrl);
                }
            });

            // Keep top 2 unique references
            references = [...new Set(foundLinks)].slice(0, 2);
            console.log(`✅ Found References:`, references);

            // 3. SCRAPE THE EXTERNAL CONTENT
            for (const link of references) {
                console.log(`📄 Scraping: ${link}`);
                try {
                    const extracted = await extract(link);
                    if (extracted && extracted.content) {
                        // Clean HTML tags and take the first 2000 characters
                        const cleanText = extracted.content.replace(/<[^>]*>?/gm, '').substring(0, 2000);
                        externalScrapedData += `\n--- CONTENT FROM ${link} ---\n${cleanText}\n`;
                    }
                } catch (scrapeErr) {
                    console.error(`⚠️ Scrape failed for ${link}:`, scrapeErr.message);
                }
            }
        } catch (searchError) {
            console.error("❌ Google Search Error:", searchError.message);
        }

        // 4. GENERATE ENHANCED CONTENT WITH GEMINI
        // Using gemini-1.5-flash for speed and stability
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `
            You are a senior content editor. 
            
            ORIGINAL ARTICLE:
            ${article.contentOriginal}
            
            RESEARCH CONTEXT FROM HIGH-AUTHORITY SOURCES:
            ${externalScrapedData || "No external context found. Use expert-level knowledge on this topic."}
            
            TASK:
            1. Rewrite the original article to be more professional, authoritative, and detailed.
            2. Match the depth and formatting style (H1, H2, H3, Bullet points) found in the research context.
            3. Ensure it is written in clean Markdown.
            4. At the end, create a "### References" section and list these URLs: ${references.join(', ')}
        `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // 5. UPDATE THE DATABASE
            const updated = await prisma.article.update({
                where: { id: article.id },
                data: {
                    contentUpdated: text,
                    references: references 
                }
            });

            results.push(updated);
            console.log(`✨ Successfully enhanced: ${article.title}`);
        } catch (aiErr) {
            console.error("❌ Gemini API Error:", aiErr.message);
        }
    }
    return results;
};