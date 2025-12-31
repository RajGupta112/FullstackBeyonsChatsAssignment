import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from '../config/db.js';

const BLOG_URL = 'https://beyondchats.com/blogs/';

async function fetchFullContent(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        // Targets the main body of the post, ignoring headers/footers
        return $('.entry-content, .elementor-widget-theme-post-content').text().trim() || "";
    } catch (error) {
        console.error(`Could not fetch content for ${url}`);
        return "";
    }
}

export const scrapeAndStore = async () => {
    try {
        const allScrapedArticles = [];
        const { data: initialData } = await axios.get(BLOG_URL);
        const $initial = cheerio.load(initialData);
        
        const pageNumbers = [];
        $initial('.page-numbers').each((i, el) => {
            const val = parseInt($initial(el).text());
            if (!isNaN(val)) pageNumbers.push(val);
        });
        
        let currentPage = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;

        while (allScrapedArticles.length < 5 && currentPage > 0) {
            const url = currentPage === 1 ? BLOG_URL : `${BLOG_URL}page/${currentPage}/`;
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const pageArticles = [];

            $('article').each((i, el) => {
                const title = $(el).find('h2').text().trim();
                const sourceUrl = $(el).find('h2 a').attr('href');
                if (title && sourceUrl) {
                    pageArticles.push({ title, sourceUrl });
                }
            });

            allScrapedArticles.push(...pageArticles.reverse());
            currentPage--; 
        }

        const finalFive = allScrapedArticles.slice(0, 5);
        const savedData = [];

        for (const article of finalFive) {
            console.log(`📥 Fetching full content for: ${article.title}`);
            // NEW: Fetch the actual body text here
            const fullContent = await fetchFullContent(article.sourceUrl);

            const saved = await prisma.article.upsert({
                where: { sourceUrl: article.sourceUrl },
                update: { contentOriginal: fullContent }, // Updates empty fields
                create: { ...article, contentOriginal: fullContent }
            });
            savedData.push(saved);
        }

        return savedData;
    } catch (error) {
        throw error;
    }
};

export const getAllArticles = async () => {
    return await prisma.article.findMany({
        orderBy: { createdAt: 'asc' } // Oldest first
    });
};



// Manual Create Service
export const createManualArticle = async (articleData) => {
    return await prisma.article.create({
        data: articleData
    });
};

// Update Service
export const updateArticleById = async (id, updateData) => {
    return await prisma.article.update({
        where: { id: parseInt(id) },
        data: updateData
    });
};

// Delete Service
export const deleteArticleById = async (id) => {
    return await prisma.article.delete({
        where: { id: parseInt(id) }
    });
};