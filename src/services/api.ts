const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

export interface AuthSession {
  token: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    role: string;
  };
}

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('avtofast_jwt_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('avtofast_jwt_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('avtofast_jwt_token');
    }
    return this.token;
  }

  // Telegram Mini App authentication
  async authenticateTelegram(params: {
    initData?: string;
    telegramId?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
  }): Promise<AuthSession | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) return null;
      const data: AuthSession = await res.json();
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err) {
      console.warn('API: Telegram auth fallback to local session', err);
      return null;
    }
  }

  // Browser Guest authentication
  async authenticateGuest(displayName?: string): Promise<AuthSession | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });

      if (!res.ok) return null;
      const data: AuthSession = await res.json();
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err) {
      console.warn('API: Guest auth fallback to local session', err);
      return null;
    }
  }

  // Profile
  async getProfile(): Promise<any | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  // Content packs
  async getContentPacks(): Promise<any | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/content/packs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  }
}

export const api = new ApiService();
