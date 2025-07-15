import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Skip auth for public routes
    if (req.path === '/api/auth/login' ||
        req.path === '/api/auth/register' ||
        req.path === '/api/data/health') {
        return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, config.sessionSecret) as { userId: string; email: string };
        req.user = { id: decoded.userId, email: decoded.email };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};