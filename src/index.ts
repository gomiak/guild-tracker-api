import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import guildRoutes from './presentation/routes/guild.routes';
import messagesRoutes from './presentation/routes/messages.routes';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://guild-tracker-i9r2.vercel.app',
    'https://*.vercel.app',
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            if (
                allowedOrigins.some(
                    (allowedOrigin) =>
                        origin === allowedOrigin ||
                        origin.endsWith('.vercel.app') ||
                        origin.includes('localhost'),
                )
            ) {
                return callback(null, true);
            }

            return callback(
                new Error('CORS policy: Origin not allowed'),
                false,
            );
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    }),
);
app.use(express.json());

app.use('/api/guild', guildRoutes);
app.use('/api/messages', messagesRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Guild Tracker API',
        version: '1.0.0',
        endpoints: {
            guildData: '/api/guild/data',
            messages: '/api/messages/data',
            forceRefresh: '/api/guild/force-refresh',
            health: '/health',
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

app.listen(PORT, () => {});
