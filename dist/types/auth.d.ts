/**
 * Authentication and session types
 */
export interface AuthSession {
    auth_token: string;
    refresh_token: string;
    user: {
        user_id: string;
        username: string;
        system_email: string;
        security_level: string;
    };
    expires_at: string;
}
export interface ApiError {
    message: string;
    code?: string;
    details?: any;
}
export interface ConnectionStatus {
    connected: boolean;
    connecting: boolean;
    lastError?: string;
    reconnectAttempts?: number;
}
//# sourceMappingURL=auth.d.ts.map