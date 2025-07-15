const API_BASE = 'http://localhost:5000/api';

export interface User {
    id: string;
    email: string;
    name: string;
}

class AuthApi {
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        const response = await fetch(`${API_BASE}/auth/login`, {
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
        const response = await fetch(`${API_BASE}/auth/register`, {
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
        localStorage.removeItem('token');
    }

    getToken() {
        return localStorage.getItem('token');
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export const authApi = new AuthApi();