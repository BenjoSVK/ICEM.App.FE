const API_BASE = process.env.REACT_APP_FAST_API_HOST ?? "";

/** Access token kept in memory only */
let accessToken: string | null = null;
/** When the current access token expires (ms since epoch). Used for proactive refresh. */
let accessTokenExpiresAt: number | null = null;

/**
 * Authentication: in-memory access token, refresh via httpOnly cookie, and fetchWithAuth wrapper.
 */
export class AuthService {
  public static setAccessToken(token: string, expiresInSeconds: number): void {
    accessToken = token;
    accessTokenExpiresAt = Date.now() + expiresInSeconds * 1000;
  }

  public static getAccessToken(): string | null {
    return accessToken;
  }

  public static clearAccessToken(): void {
    accessToken = null;
    accessTokenExpiresAt = null;
  }

  /** Returns true if the access token will expire within the given margin (default 2 minutes). */
  public static isTokenExpiringSoon(marginMs: number = 2 * 60 * 1000): boolean {
    if (accessTokenExpiresAt == null) return true;
    return Date.now() >= accessTokenExpiresAt - marginMs;
  }

  private static getAuthHeader(): Record<string, string> {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  /**
   * Refresh access token using the httpOnly refresh cookie.
   * @returns true if a new access token was obtained, false otherwise.
   */
  public static async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/ikem_api/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) return false;
      const data = await response.json();
      const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 900;
      this.setAccessToken(data.access_token, expiresIn);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates the current token by making a request to an authenticated endpoint.
   * If no in-memory token, tries refresh first.
   * @returns true if token is valid (or refresh succeeded), false otherwise.
   */
  public static async validateToken(): Promise<boolean> {
    if (accessToken) {
      try {
        const response = await this.fetchWithAuth(
          `${API_BASE}/ikem_api/get-tiff-files?limit=1`
        );
        return response.ok;
      } catch {
        return false;
      }
    }
    return this.refreshToken();
  }

  public static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
      ...this.getAuthHeader(),
    };

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers, credentials: "include" });
    } catch (error) {
      throw error;
    }

    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return fetch(url, {
          ...options,
          headers: { ...headers, ...this.getAuthHeader() },
          credentials: "include",
        });
      }
      this.clearAccessToken();
      const returnPath = window.location.pathname + window.location.search;
      sessionStorage.setItem("loginRedirect", returnPath);
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (response.ok) {
      localStorage.setItem("lastActivity", Date.now().toString());
    }
    return response;
  }
}
