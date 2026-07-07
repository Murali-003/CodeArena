export const api = {
  async get(url: string, init?: RequestInit) {
    return this.request(url, { ...init, method: 'GET' });
  },
  async post(url: string, body: any, init?: RequestInit) {
    return this.request(url, {
      ...init,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      body: JSON.stringify(body),
    });
  },
  async put(url: string, body: any, init?: RequestInit) {
    return this.request(url, {
      ...init,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      body: JSON.stringify(body),
    });
  },
  async delete(url: string, init?: RequestInit) {
    return this.requestNoBody(url, { ...init, method: 'DELETE' });
  },
  async request(url: string, init?: RequestInit) {
    const config: RequestInit = {
      ...init,
      credentials: 'include', // Ensure HttpOnly JWT cookies are sent
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new Event('auth-unauthorized'));
        }
        const errorData = await response.json().catch(() => null);
        const err = new Error(errorData?.message || errorData?.error || `HTTP error! status: ${response.status}`);
        (err as any).status = response.status;
        throw err;
      }
      // 204 No Content — no body to parse
      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },
  async requestNoBody(url: string, init?: RequestInit) {
    const config: RequestInit = {
      ...init,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new Event('auth-unauthorized'));
        }
        const errorData = await response.json().catch(() => null);
        const err = new Error(errorData?.message || errorData?.error || `HTTP error! status: ${response.status}`);
        (err as any).status = response.status;
        throw err;
      }
      return null;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }
};
