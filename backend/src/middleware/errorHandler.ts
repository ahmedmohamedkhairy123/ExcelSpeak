import { Request, Response, NextFunction } from 'express';
import config from '../config/env';

interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', {
        message: err.message,
        stack: config.isDevelopment ? err.stack : undefined,
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message,
            ...(config.isDevelopment && { stack: err.stack }),
            timestamp: new Date().toISOString(),
        },
    });
};