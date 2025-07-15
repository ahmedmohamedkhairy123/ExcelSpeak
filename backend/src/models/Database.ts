import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import config from '../config/env';

export interface TableInfo {
    id: string;
    name: string;
    columns: string[];
    rowCount: number;
    fileName: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface QueryHistory {
    id: string;
    userId?: string;
    query: string;
    sql: string;
    result?: any;
    timestamp: Date;
}

class Database {
    private static instance: Database;
    private db: any;

    private constructor() { }

    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async initialize() {
        this.db = await open({
            filename: path.resolve(config.databaseUrl),
            driver: sqlite3.Database,
        });

        await this.createTables();
    }

    async getDb() {
        if (!this.db) {
            await this.initialize();
        }
        return this.db;
    }

    private async createTables() {
        await this.db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Existing tables (keep these)
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      columns TEXT NOT NULL,
      row_count INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      user_id TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS query_history (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      query TEXT NOT NULL,
      sql TEXT NOT NULL,
      result TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_tables_user_id ON tables(user_id);
    CREATE INDEX IF NOT EXISTS idx_history_user_id ON query_history(user_id);
  `);
    }

    async saveTable(table: Omit<TableInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<TableInfo> {
        const id = `tbl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const columnsJson = JSON.stringify(table.columns);

        await this.db.run(
            `INSERT INTO tables (id, name, columns, row_count, file_name, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [id, table.name, columnsJson, table.rowCount, table.fileName, table.userId]
        );

        return {
            id,
            ...table,
            columns: table.columns,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    async getTables(userId?: string): Promise<TableInfo[]> {
        const query = userId
            ? `SELECT * FROM tables WHERE user_id = ? ORDER BY created_at DESC`
            : `SELECT * FROM tables ORDER BY created_at DESC`;

        const params = userId ? [userId] : [];
        const rows = await this.db.all(query, params);

        return rows.map((row: any) => ({
            id: row.id,
            name: row.name,
            columns: JSON.parse(row.columns),
            rowCount: row.row_count,
            fileName: row.file_name,
            userId: row.user_id,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        }));
    }

    async saveQuery(history: Omit<QueryHistory, 'id' | 'timestamp'>): Promise<QueryHistory> {
        const id = `qry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const resultJson = history.result ? JSON.stringify(history.result) : null;

        await this.db.run(
            `INSERT INTO query_history (id, user_id, query, sql, result) 
       VALUES (?, ?, ?, ?, ?)`,
            [id, history.userId, history.query, history.sql, resultJson]
        );

        return {
            id,
            ...history,
            result: history.result,
            timestamp: new Date(),
        };
    }

    async getQueryHistory(userId?: string, limit: number = 20): Promise<QueryHistory[]> {
        const query = userId
            ? `SELECT * FROM query_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?`
            : `SELECT * FROM query_history ORDER BY timestamp DESC LIMIT ?`;

        const params = userId ? [userId, limit] : [limit];
        const rows = await this.db.all(query, params);

        return rows.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            query: row.query,
            sql: row.sql,
            result: row.result ? JSON.parse(row.result) : null,
            timestamp: new Date(row.timestamp),
        }));
    }

    async deleteTable(id: string, userId?: string): Promise<boolean> {
        const query = userId
            ? `DELETE FROM tables WHERE id = ? AND user_id = ?`
            : `DELETE FROM tables WHERE id = ?`;

        const params = userId ? [id, userId] : [id];
        const result = await this.db.run(query, params);
        return result.changes > 0;
    }

    async clearHistory(userId?: string): Promise<number> {
        const query = userId
            ? `DELETE FROM query_history WHERE user_id = ?`
            : `DELETE FROM query_history`;

        const params = userId ? [userId] : [];
        const result = await this.db.run(query, params);
        return result.changes;
    }
}

export default Database;