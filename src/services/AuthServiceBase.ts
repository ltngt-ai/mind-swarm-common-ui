/**
 * Base authentication service that handles token lifecycle
 * Framework-agnostic implementation that can be extended for specific platforms
 */

import type { AuthSession, ApiError } from '../types/auth.js';

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  authToken?: string;
  refreshToken?: string;
  user?: {
    email: string;
    securityLevel: string;
  };
}

export interface AuthStorage {
  getAuthState(): Promise<AuthState | null>;
  saveAuthState(state: AuthState): Promise<void>;
  clearAuthState(): Promise<void>;
}

export interface AuthApiClient {
  login(username: string, password: string): Promise<AuthSession>;
  refreshToken(refreshToken: string): Promise<{ auth_token: string; expires_at: string }>;
}

export interface AuthEventCallbacks {
  onLogin?: (state: AuthState) => void;
  onLogout?: () => void;
  onTokenRefresh?: (newToken: string) => void;
  onAuthError?: (error: ApiError) => void;
}

export class AuthServiceBase {
  private refreshTimer?: ReturnType<typeof setTimeout> | undefined;
  private isRefreshing = false;
  
  constructor(
    protected storage: AuthStorage,
    protected apiClient: AuthApiClient,
    protected callbacks: AuthEventCallbacks = {}
  ) {}

  /**
   * Initialize auth service - check and refresh tokens on app start
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    const authState = await this.storage.getAuthState();
    
    // No stored auth - need fresh login
    if (!authState?.refreshToken) {
      return { success: false };
    }
    
    // Check if auth token is still valid (not expired)
    if (authState.authToken && this.isTokenValid(authState.authToken)) {
      // Token still good - schedule next refresh
      this.scheduleTokenRefresh(authState.authToken);
      return { success: true };
    }
    
    // Auth token expired or missing - refresh it
    return await this.refreshAuthToken();
  }

  /**
   * Perform login
   */
  async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.apiClient.login(username, password);
      
      // Store auth data
      const authState: AuthState = {
        authToken: response.auth_token,
        refreshToken: response.refresh_token,
        user: {
          email: response.user.system_email,
          securityLevel: response.user.security_level
        }
      };

      await this.storage.saveAuthState(authState);
      
      // Schedule token refresh
      this.scheduleTokenRefresh(response.auth_token);
      
      // Notify callbacks
      this.callbacks.onLogin?.(authState);
      
      return { success: true };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.message || 'Login failed',
        code: error.code,
        details: error
      };
      
      this.callbacks.onAuthError?.(apiError);
      
      return { 
        success: false, 
        error: apiError.message 
      };
    }
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    // Clear stored auth
    await this.storage.clearAuthState();
    
    // Cancel any pending refresh
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
    
    // Notify callbacks
    this.callbacks.onLogout?.();
  }

  /**
   * Get current auth state
   */
  async getAuthState(): Promise<AuthState | null> {
    return await this.storage.getAuthState();
  }

  /**
   * Get current auth token
   */
  async getAuthToken(): Promise<string | null> {
    const authState = await this.storage.getAuthState();
    return authState?.authToken || null;
  }

  /**
   * Check if currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const authState = await this.storage.getAuthState();
    return !!(authState?.authToken && this.isTokenValid(authState.authToken));
  }

  /**
   * Refresh the auth token
   */
  async refreshAuthToken(): Promise<{ success: boolean; error?: string }> {
    if (this.isRefreshing) {
      return { success: false, error: 'Refresh already in progress' };
    }

    this.isRefreshing = true;
    
    try {
      const authState = await this.storage.getAuthState();
      
      if (!authState?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.apiClient.refreshToken(authState.refreshToken);
      
      // Update stored auth with new token
      const newAuthState: AuthState = {
        ...authState,
        authToken: response.auth_token
      };

      await this.storage.saveAuthState(newAuthState);
      
      // Schedule next refresh
      this.scheduleTokenRefresh(response.auth_token);
      
      // Notify callbacks
      this.callbacks.onTokenRefresh?.(response.auth_token);
      
      return { success: true };
    } catch (error: any) {
      // Refresh failed - likely need to re-login
      await this.logout();
      
      const apiError: ApiError = {
        message: error.message || 'Token refresh failed',
        code: error.code,
        details: error
      };
      
      this.callbacks.onAuthError?.(apiError);
      
      return { 
        success: false, 
        error: apiError.message 
      };
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Check if a JWT token is still valid (not expired)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now + 300; // Valid if expires in more than 5 minutes
    } catch {
      return false;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;
      
      // Refresh when 80% of lifetime has passed, but at least 5 minutes before expiry
      const refreshIn = Math.max(expiresIn * 0.8, expiresIn - 300) * 1000;
      
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }
      
      this.refreshTimer = setTimeout(() => {
        this.refreshAuthToken();
      }, refreshIn);
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }
}