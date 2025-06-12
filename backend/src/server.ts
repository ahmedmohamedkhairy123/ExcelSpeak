import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/env';
import Database from './models/Database';
import { corsMiddleware } from './middleware/corsMiddleware';
import { errorHandler } from './middleware/errorHandler';
import dataRoutes from './routes/dataRoutes';

// Initialize database
const db = Database.getInstance();

async function startServer() {
    try {
        // Initialize database
        await db.initialize();
        console.log('✅ Database initialized');

        const app = express();

        // Security middleware
        app.use(helmet());
        app.use(corsMiddleware);

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
        });
        app.use('/api/', limiter);

        // Body parsing
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging (development only)
        if (config.isDevelopment) {
            app.use((req, res, next) => {
                console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
                next();
            });
        }

        // API routes
        app.use('/api/data', dataRoutes);

        // Test endpoint
        app.get('/', (req, res) => {
            res.json({
                service: 'DataInsight Backend API',
                version: '1.0.0',
                status: 'running',
                documentation: '/api/data/health',
                environment: config.nodeEnv,
            });
        });

        // 404 handler
        app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: `Cannot ${req.method} ${req.originalUrl}`,
            });
        });

        // Error handler (must be last)
        app.use(errorHandler);

        // Start server
        const port = config.port;
        app.listen(port, () => {
            console.log(`
🚀 Server running on port ${port}
📁 Environment: ${config.nodeEnv}
🌐 CORS Origin: ${config.corsOrigin}
📊 Database: ${config.databaseUrl}
      `);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();