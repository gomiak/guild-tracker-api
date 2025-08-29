import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import guildRoutes from './presentation/routes/guild.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/guild', guildRoutes);

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

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Endpoints available at http://localhost:${PORT}/api/guild`);
});
