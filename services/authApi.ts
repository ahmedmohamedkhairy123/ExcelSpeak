import { mockApi } from './mockApi';

export interface User {
  id: string;
  email: string;
  name: string;
}

class AuthApi {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // ALWAYS use mock in production
    return mockApi.login(email, password);
  }

  async register(email: string, password: string, name: string) {
    // ALWAYS use mock in production
    return mockApi.register(email, password, name);
  }

  logout() {
    mockApi.logout();
  }

  getToken() {
    const user = mockApi.getCurrentUser();
    return user?.token || null;
  }

  isAuthenticated() {
    return mockApi.isAuthenticated();
  }
}

export const authApi = new AuthApi();