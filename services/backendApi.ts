import { TableInfo, HistoryItem } from '../types';

const API_BASE = 'http://localhost:5000/api';

export interface BackendTable extends TableInfo {
    id: string;
    sampleData?: any[];
}

export interface BackendHistoryItem extends HistoryItem {
    id: string;
    result?: any;
}

export const backendApi = {
    // Health check
    async healthCheck(): Promise<{ status: string; timestamp: string }> {
        try {
            const response = await fetch(`${API_BASE}/data/health`);
            return response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    },

    // Upload file to backend
    async uploadFile(file: File, cleanOption?: string, customVal?: string): Promise<{ success: boolean; table: BackendTable }> {
        const formData = new FormData();
        formData.append('file', file);

        if (cleanOption) {
            formData.append('cleanOption', cleanOption);
        }
        if (customVal) {
            formData.append('customVal', customVal);
        }

        // Add auth token if exists
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/data/upload`, {
            method: 'POST',
            body: formData,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(error.error || 'Upload failed');
        }

        return response.json();
    },

    // Get all tables from backend
    async getTables(): Promise<{ tables: BackendTable[] }> {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/data/tables`, { headers });
            if (!response.ok) throw new Error('Failed to fetch tables');
            return response.json();
        } catch (error) {
            console.error('Failed to get tables:', error);
            throw error;
        }
    },

    // Save query to backend history
    async saveQuery(query: string, sql: string, result?: any): Promise<{ success: boolean; history: BackendHistoryItem }> {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/data/history`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ query, sql, result }),
            });
            return response.json();
        } catch (error) {
            console.error('Failed to save query:', error);
            throw error;
        }
    },

    // Get query history from backend
    async getHistory(limit: number = 20): Promise<{ history: BackendHistoryItem[] }> {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/data/history?limit=${limit}`, { headers });
            if (!response.ok) throw new Error('Failed to fetch history');
            return response.json();
        } catch (error) {
            console.error('Failed to get history:', error);
            throw error;
        }
    },

    // Clear history from backend
    async clearHistory(): Promise<{ success: boolean; deletedCount: number }> {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/data/history`, {
                method: 'DELETE',
                headers,
            });
            return response.json();
        } catch (error) {
            console.error('Failed to clear history:', error);
            throw error;
        }
    },

    // Delete table from backend
    async deleteTable(tableId: string): Promise<{ success: boolean }> {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/data/tables/${tableId}`, {
                method: 'DELETE',
                headers,
            });
            return response.json();
        } catch (error) {
            console.error('Failed to delete table:', error);
            throw error;
        }
    },

    // Test backend connection
    async testConnection(): Promise<boolean> {
        try {
            const health = await this.healthCheck();
            return health.status === 'healthy';
        } catch (error) {
            console.error('Backend connection test failed:', error);
            return false;
        }
    }
};