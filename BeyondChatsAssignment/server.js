import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articleRoutes from './routes/articleRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base Route for testing if API is alive
app.get('/', (req, res) => {
    res.json({ message: "BeyondChats AI Automation API is live!" });
});

// Routes - All article and automation logic is bundled here
app.use('/api/articles', articleRoutes);

// Global Error Handler (Industry Standard)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});