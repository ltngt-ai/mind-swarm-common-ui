/**
 * Base authentication service that handles token lifecycle
 * Framework-agnostic implementation that can be extended for specific platforms
 */
export class AuthServiceBase {
    storage;
    apiClient;
    callbacks;
    refreshTimer;
    isRefreshing = false;
    constructor(storage, apiClient, callbacks = {}) {
        this.storage = storage;
        this.apiClient = apiClient;
        this.callbacks = callbacks;
    }
    /**
     * Initialize auth service - check and refresh tokens on app start
     */
    async initialize() {
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
    async login(username, password) {
        try {
            const response = await this.apiClient.login(username, password);
            // Store auth data
            const authState = {
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
        }
        catch (error) {
            const apiError = {
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
    async logout() {
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
    async getAuthState() {
        return await this.storage.getAuthState();
    }
    /**
     * Get current auth token
     */
    async getAuthToken() {
        const authState = await this.storage.getAuthState();
        return authState?.authToken || null;
    }
    /**
     * Check if currently authenticated
     */
    async isAuthenticated() {
        const authState = await this.storage.getAuthState();
        return !!(authState?.authToken && this.isTokenValid(authState.authToken));
    }
    /**
     * Refresh the auth token
     */
    async refreshAuthToken() {
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
            const newAuthState = {
                ...authState,
                authToken: response.auth_token
            };
            await this.storage.saveAuthState(newAuthState);
            // Schedule next refresh
            this.scheduleTokenRefresh(response.auth_token);
            // Notify callbacks
            this.callbacks.onTokenRefresh?.(response.auth_token);
            return { success: true };
        }
        catch (error) {
            // Refresh failed - likely need to re-login
            await this.logout();
            const apiError = {
                message: error.message || 'Token refresh failed',
                code: error.code,
                details: error
            };
            this.callbacks.onAuthError?.(apiError);
            return {
                success: false,
                error: apiError.message
            };
        }
        finally {
            this.isRefreshing = false;
        }
    }
    /**
     * Check if a JWT token is still valid (not expired)
     */
    isTokenValid(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            return payload.exp > now + 300; // Valid if expires in more than 5 minutes
        }
        catch {
            return false;
        }
    }
    /**
     * Schedule automatic token refresh
     */
    scheduleTokenRefresh(token) {
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
        }
        catch (error) {
            console.error('Failed to schedule token refresh:', error);
        }
    }
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = undefined;
        }
    }
}
//# sourceMappingURL=AuthServiceBase.js.map