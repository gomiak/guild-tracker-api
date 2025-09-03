import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import guildRoutes from './presentation/routes/guild.routes';
import messagesRoutes from './presentation/routes/messages.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/guild', guildRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Guild Tracker API',
        version: '1.0.0',
        endpoints: {
            guildData: '/api/guild/data',
            forceRefresh: '/api/guild/force-refresh',
            health: '/api/guild/health',
        },
    });
});

app.use(
    (
        error: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        console.error('Unhandled error:', error);
        res.status(500).json({ error: 'Internal server error' });
    },
);
app.use('/api/messages', messagesRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
