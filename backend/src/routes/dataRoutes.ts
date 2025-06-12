import { Router } from 'express';
import { DataController } from '../controllers/dataController';
import { upload } from '../middleware/uploadMiddleware';
import { processUploadedFile } from '../utils/fileProcessor';  // ADD THIS IMPORT
const router = Router();
// === ADD THIS TEST ROUTE FIRST ===
router.post('/upload-test', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`📁 File received: ${file.originalname} (${file.size} bytes)`);

        // Process the file
        const processedFile = await processUploadedFile(file);

        console.log(`✅ Processed ${processedFile.rowCount} rows, ${processedFile.columns.length} columns`);

        res.json({
            success: true,
            message: `File processed successfully`,
            originalName: file.originalname,
            columns: processedFile.columns,
            rowCount: processedFile.rowCount,
            sampleData: processedFile.data.slice(0, 3), // First 3 rows
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('❌ Upload test error:', error);
        res.status(500).json({
            error: 'File processing failed',
            details: error.message
        });
    }
});
// Health check
router.get('/health', DataController.healthCheck);

// File operations
router.post('/upload', upload.single('file'), DataController.uploadFile);
router.get('/tables', DataController.getTables);
router.delete('/tables/:id', DataController.deleteTable);

// Query history
router.post('/history', DataController.saveQuery);
router.get('/history', DataController.getHistory);
router.delete('/history', DataController.clearHistory);

export default router;