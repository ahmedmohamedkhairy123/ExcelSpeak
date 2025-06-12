import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || './data/database.sqlite',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
};

export default config;