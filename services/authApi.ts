import { mockApi } from './mockApi';

export interface User {
  id: string;
  email: string;
  name: string;
}

class AuthApi {
  private mode: 'local' | 'backend' | 'mock' = 'local';

  setMode(mode: 'local' | 'backend' | 'mock') {
    this.mode = mode;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    if (this.mode === 'mock') {
      return mockApi.login(email, password);
    }
    
    // Original backend login
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  }

  async register(email: string, password: string, name: string) {
    if (this.mode === 'mock') {
      return mockApi.register(email, password, name);
    }
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  }

  logout() {
    if (this.mode === 'mock') {
      mockApi.logout();
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    if (this.mode === 'mock') {
      const user = mockApi.getCurrentUser();
      return user?.token || null;
    }
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    if (this.mode === 'mock') {
      return mockApi.isAuthenticated();
    }
    return !!this.getToken();
  }
}

export const authApi = new AuthApi();