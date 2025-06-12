import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync'; // Use sync version for simplicity
import * as XLSX from 'xlsx';
import config from '../config/env';

export interface ProcessedFile {
    originalName: string;
    fileName: string;
    filePath: string;
    columns: string[];
    data: any[];
    rowCount: number;
}

export async function processUploadedFile(file: Express.Multer.File): Promise<ProcessedFile> {
    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${extension}`;
    const filePath = path.join(config.uploadDir, fileName);

    // Ensure upload directory exists
    if (!fs.existsSync(config.uploadDir)) {
        fs.mkdirSync(config.uploadDir, { recursive: true });
    }

    // Move file to upload directory
    fs.renameSync(file.path, filePath);

    let data: any[] = [];
    let columns: string[] = [];

    try {
        if (extension === '.csv') {
            // Read and parse CSV file synchronously
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            // Use sync parse for simplicity
            data = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                bom: true, // Handle BOM if present
            });

            columns = data.length > 0 ? Object.keys(data[0]) : [];
        } else if (extension === '.xlsx' || extension === '.xls') {
            // Read Excel file
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];
            data = jsonData;
            columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        } else {
            throw new Error(`Unsupported file type: ${extension}`);
        }

        // Clean data: remove empty rows and handle null values
        const cleanedData = data
            .filter(row => {
                const values = Object.values(row);
                return values.some(val => val !== null && val !== '' && val !== undefined);
            })
            .map(row => {
                const cleanedRow: any = {};
                Object.entries(row).forEach(([key, value]) => {
                    // Trim column names and clean values
                    const cleanKey = key.trim();
                    let cleanValue = value;

                    // Convert string numbers to numbers if possible
                    if (typeof cleanValue === 'string') {
                        const trimmed = cleanValue.trim();
                        if (trimmed === '') {
                            cleanValue = null;
                        } else if (!isNaN(Number(trimmed)) && trimmed !== '') {
                            cleanValue = Number(trimmed);
                        }
                    }

                    cleanedRow[cleanKey] = cleanValue;
                });
                return cleanedRow;
            });

        console.log(`Processed ${cleanedData.length} rows from ${file.originalname}`);

        return {
            originalName: file.originalname,
            fileName,
            filePath,
            columns,
            data: cleanedData,
            rowCount: cleanedData.length,
        };
    } catch (error: any) {
        // Clean up file if processing fails
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw new Error(`Failed to process file: ${error.message}`);
    }
}

export function cleanupFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            console.error(`Failed to delete file: ${filePath}`, error);
        }
    }
}