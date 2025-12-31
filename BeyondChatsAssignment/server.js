import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articleRoutes from './routes/articleRoutes.js';

dotenv.config();

const app = express();


const allowedOrigins = [
    'http://localhost:5173', 
    'https://fullstack-beyons-chats-assignment.vercel.app' 
];

app.use(cors({
    origin: function (origin, callback) {
       
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
// ----------------------------------

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "BeyondChats AI Automation API is live!" });
});

app.use('/api/articles', articleRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});