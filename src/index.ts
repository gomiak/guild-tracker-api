import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import guildRoutes from './presentation/routes/guild.routes';
import messagesRoutes from './presentation/routes/messages.routes';

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = [
    'http://localhost:3000', // Frontend local
    'http://localhost:3001', // Backend local (se applicable)
    'https://seu-frontend.vercel.app', // Seu futuro domínio Vercel
    'https://*.vercel.app', // Todos subdomínios Vercel
];
app.use(
    cors({
        origin: function (origin, callback) {
            // Permite requests sem origin (Postman, mobile apps, etc)
            if (!origin) return callback(null, true);

            // Verifica se a origin está na lista permitida
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

            // Rejeita requests de origens não permitidas
            return callback(
                new Error('CORS policy: Origin not allowed'),
                false,
            );
        },
        credentials: true,
    }),
);
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
