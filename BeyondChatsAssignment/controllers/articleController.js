// Change this line:
import * as articleService from '../services/articleService.js';

export const triggerScrape = async (req, res) => {
    try {
        const data = await articleService.scrapeAndStore();
        res.status(201).json({ message: "Scraping completed", count: data.length, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const fetchArticles = async (req, res) => {
    try {
        const data = await articleService.getAllArticles();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Manual Create
export const createArticle = async (req, res) => {
    try {
        const data = await articleService.createManualArticle(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Manual Update
export const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await articleService.updateArticleById(id, req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Manual Delete
export const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        await articleService.deleteArticleById(id);
        res.status(200).json({ message: "Article deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};