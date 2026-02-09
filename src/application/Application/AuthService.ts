export class AuthService {
  private static getAuthHeader() {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Validates the current token by making a request to an authenticated endpoint
   * @returns true if token is valid, false otherwise
   */
  public static async validateToken(): Promise<boolean> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return false;
    }

    try {
      // Use a lightweight endpoint to validate the token
      const response = await this.fetchWithAuth(
        `${process.env.REACT_APP_FAST_API_HOST}/ikem_api/get-tiff-files?limit=1`
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  public static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = {
      ...options.headers,
      ...this.getAuthHeader(),
    };

    let response;
    try {
        response = await fetch(url, { ...options, headers: headers as HeadersInit });
    } catch (error) {
        // token expired or invalid
        // localStorage.removeItem('access_token');
        // localStorage.removeItem('isAuthenticated');
        // window.location.href = '/login';
        throw error
    }
    
    if (response.status === 401) {
          // Token expired or invalid; keep processingTasks so polling can resume after re-login
          localStorage.removeItem('access_token');
          localStorage.removeItem('isAuthenticated');
          const returnPath = window.location.pathname + window.location.search;
          sessionStorage.setItem('loginRedirect', returnPath);
          window.location.href = '/login';
        throw new Error('Unauthorized');
    }
    if (response.ok)
    {
      localStorage.setItem('lastActivity', Date.now().toString());
    }
    return response;
  }
} 