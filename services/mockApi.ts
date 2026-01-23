import { TableInfo, HistoryItem } from '../types';

// Mock user storage in localStorage
const MOCK_USERS_KEY = 'mock_users';
const MOCK_HISTORY_KEY = 'mock_history';
const MOCK_TABLES_KEY = 'mock_tables';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

export const mockApi = {
  // === AUTHENTICATION ===
  async login(email: string, password: string): Promise<LoginResponse> {
    // Get existing users
    const users: MockUser[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    
    // Check if user exists
    let user = users.find(u => u.email === email);
    
    if (!user) {
      // Auto-create user if doesn't exist (for demo)
      user = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        token: `mock_token_${Date.now()}`
      };
      users.push(user);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    }
    
    // In mock mode, any password works
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token: user.token
    };
  },

  async register(email: string, password: string, name: string) {
    const users: MockUser[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    
    const newUser: MockUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      token: `mock_token_${Date.now()}`
    };
    
    users.push(newUser);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      token: newUser.token
    };
  },

  logout() {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser(): MockUser | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  },

  // === TABLES ===
  async uploadFile(file: File): Promise<{ success: boolean; table: TableInfo }> {
    const user = this.getCurrentUser();
    const tableId = `tbl_${Date.now()}`;
    
    const tableInfo: TableInfo = {
      name: tableId,
      columns: ['id', 'name', 'value'], // Mock columns
      rowCount: Math.floor(Math.random() * 100) + 1, // Random 1-100 rows
      fileName: file.name
    };
    
    // Save to mock storage
    const tables: TableInfo[] = JSON.parse(localStorage.getItem(MOCK_TABLES_KEY) || '[]');
    tables.push(tableInfo);
    localStorage.setItem(MOCK_TABLES_KEY, JSON.stringify(tables));
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      table: tableInfo
    };
  },

  async getTables(): Promise<{ tables: TableInfo[] }> {
    const tables: TableInfo[] = JSON.parse(localStorage.getItem(MOCK_TABLES_KEY) || '[]');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { tables };
  },

  // === HISTORY ===
  async saveQuery(query: string, sql: string, result?: any) {
    const history: HistoryItem[] = JSON.parse(localStorage.getItem(MOCK_HISTORY_KEY) || '[]');
    
    const newItem: HistoryItem = {
      id: `hist_${Date.now()}`,
      query,
      sql,
      timestamp: Date.now()
    };
    
    history.unshift(newItem);
    // Keep only last 20 items
    localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    
    return {
      success: true,
      history: newItem
    };
  },

  async getHistory(limit = 20): Promise<{ history: HistoryItem[] }> {
    const history: HistoryItem[] = JSON.parse(localStorage.getItem(MOCK_HISTORY_KEY) || '[]');
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { history: history.slice(0, limit) };
  },

  async clearHistory() {
    localStorage.removeItem(MOCK_HISTORY_KEY);
    return { success: true, deletedCount: 1 };
  },

  // === HEALTH ===
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Mock Backend (Local)'
    };
  },

  testConnection(): boolean {
    return true; // Mock always connected
  }
};