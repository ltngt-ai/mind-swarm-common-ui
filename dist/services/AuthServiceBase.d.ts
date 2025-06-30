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
    refreshToken(refreshToken: string): Promise<{
        auth_token: string;
        expires_at: string;
    }>;
}
export interface AuthEventCallbacks {
    onLogin?: (state: AuthState) => void;
    onLogout?: () => void;
    onTokenRefresh?: (newToken: string) => void;
    onAuthError?: (error: ApiError) => void;
}
export declare class AuthServiceBase {
    protected storage: AuthStorage;
    protected apiClient: AuthApiClient;
    protected callbacks: AuthEventCallbacks;
    private refreshTimer?;
    private isRefreshing;
    constructor(storage: AuthStorage, apiClient: AuthApiClient, callbacks?: AuthEventCallbacks);
    /**
     * Initialize auth service - check and refresh tokens on app start
     */
    initialize(): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Perform login
     */
    login(username: string, password: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Perform logout
     */
    logout(): Promise<void>;
    /**
     * Get current auth state
     */
    getAuthState(): Promise<AuthState | null>;
    /**
     * Get current auth token
     */
    getAuthToken(): Promise<string | null>;
    /**
     * Check if currently authenticated
     */
    isAuthenticated(): Promise<boolean>;
    /**
     * Refresh the auth token
     */
    refreshAuthToken(): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Check if a JWT token is still valid (not expired)
     */
    private isTokenValid;
    /**
     * Schedule automatic token refresh
     */
    private scheduleTokenRefresh;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
//# sourceMappingURL=AuthServiceBase.d.ts.map