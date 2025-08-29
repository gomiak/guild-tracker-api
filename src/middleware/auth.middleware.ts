import { Request, Response, NextFunction } from 'express';

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ error: 'Invalid API key' });
    }

    next();
};
