import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import config from '../config/env';

// Configure storage
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, config.uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Only ${allowedExtensions.join(', ')} are allowed.`));
    }
};

// Create multer instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.maxFileSize,
    },
});