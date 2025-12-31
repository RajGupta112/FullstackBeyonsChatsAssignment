import express from 'express';
import { 
    triggerScrape, 
    fetchArticles, 
    createArticle, 
    updateArticle, 
    deleteArticle 
} from '../controllers/articleController.js';
import { triggerAutomation } from '../controllers/automationController.js';

const router = express.Router();

// --- Phase 1: Scraping & CRUD ---
router.post('/scrape', triggerScrape); 
router.get('/', fetchArticles);        
router.post('/', createArticle);       
router.put('/:id', updateArticle);     
router.delete('/:id', deleteArticle);  

// --- Phase 2: AI Automation ---
router.post('/automate', triggerAutomation);

export default router;