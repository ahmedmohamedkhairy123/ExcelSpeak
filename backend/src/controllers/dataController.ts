import { Request, Response } from 'express';
import Database, { TableInfo, QueryHistory } from '../models/Database';
import { processUploadedFile, cleanupFile } from '../utils/fileProcessor';
import { v4 as uuidv4 } from 'uuid';

const db = Database.getInstance();

export class DataController {
    static async uploadFile(req: Request, res: Response) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const userId = (req as any).user?.id;
            const cleanOption = req.body.cleanOption || 'none';
            const customVal = req.body.customVal || '';

            const processedFile = await processUploadedFile(file);

            // Generate table name
            const tableName = `table_${uuidv4().replace(/-/g, '_')}`;

            // Save to database
            const tableInfo: Omit<TableInfo, 'id' | 'createdAt' | 'updatedAt'> = {
                name: tableName,
                columns: processedFile.columns,
                rowCount: processedFile.rowCount,
                fileName: processedFile.originalName,
                userId,
            };

            const savedTable = await db.saveTable(tableInfo);

            // Clean up uploaded file after processing
            cleanupFile(processedFile.filePath);

            res.status(201).json({
                success: true,
                table: {
                    ...savedTable,
                    // Include sample data for frontend
                    sampleData: processedFile.data.slice(0, 5),
                },
            });
        } catch (error: any) {
            console.error('Upload error:', error);
            res.status(500).json({
                error: 'Failed to process file',
                details: error.message
            });
        }
    }

    static async getTables(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;  // Get user from auth middleware
            const tables = await db.getTables(userId);
            res.json({ tables });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteTable(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;

            const deleted = await db.deleteTable(id, userId);

            if (deleted) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Table not found' });
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async saveQuery(req: Request, res: Response) {
        try {
            const { query, sql, result } = req.body;
            const userId = (req as any).user?.id;  // Get user from auth middleware

            if (!query || !sql) {
                return res.status(400).json({ error: 'Query and SQL are required' });
            }

            const history: Omit<QueryHistory, 'id' | 'timestamp'> = {
                userId,
                query,
                sql,
                result,
            };

            const saved = await db.saveQuery(history);
            res.status(201).json({ success: true, history: saved });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getHistory(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const limit = parseInt(req.query.limit as string) || 20;

            const history = await db.getQueryHistory(userId, limit);
            res.json({ history });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async clearHistory(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const deletedCount = await db.clearHistory(userId);
            res.json({ success: true, deletedCount });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async healthCheck(req: Request, res: Response) {
        try {
            // Test database connection
            await db.getTables();
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'DataInsight Backend',
                version: '1.0.0'
            });
        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                error: 'Database connection failed'
            });
        }
    }
}