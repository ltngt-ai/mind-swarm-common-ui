/**
 * Configuration management utilities
 */
/**
 * Default configuration values
 */
export const defaultConfig = {
    websocketUrl: 'ws://localhost:8000/ws',
    apiBaseUrl: 'http://localhost:8000/api',
    timeout: 180000, // 3 minutes
    reconnectInterval: 5000, // 5 seconds  
    maxReconnectAttempts: 10,
    debugMode: false
};
/**
 * Merge configuration with defaults
 */
export function mergeConfig(config = {}) {
    return {
        ...defaultConfig,
        ...config
    };
}
/**
 * Get configuration from environment variables
 */
export function getEnvConfig() {
    const config = {};
    // Check for common environment variables
    if (typeof process !== 'undefined' && process.env) {
        if (process.env.MINDSWARM_WS_URL) {
            config.websocketUrl = process.env.MINDSWARM_WS_URL;
        }
        if (process.env.MINDSWARM_API_URL) {
            config.apiBaseUrl = process.env.MINDSWARM_API_URL;
        }
        if (process.env.MINDSWARM_TIMEOUT) {
            config.timeout = parseInt(process.env.MINDSWARM_TIMEOUT, 10);
        }
        if (process.env.MINDSWARM_DEBUG) {
            config.debugMode = process.env.MINDSWARM_DEBUG === 'true';
        }
    }
    // Browser environment (check window object)
    if (typeof window !== 'undefined') {
        // Could check for window-specific config here if needed
    }
    return config;
}
/**
 * Validate configuration
 */
export function validateConfig(config) {
    const errors = [];
    if (config.websocketUrl && !isValidUrl(config.websocketUrl)) {
        errors.push('Invalid websocketUrl: must be a valid WebSocket URL');
    }
    if (config.apiBaseUrl && !isValidUrl(config.apiBaseUrl)) {
        errors.push('Invalid apiBaseUrl: must be a valid HTTP/HTTPS URL');
    }
    if (config.timeout && (config.timeout < 1000 || config.timeout > 600000)) {
        errors.push('Invalid timeout: must be between 1000ms and 600000ms');
    }
    if (config.maxReconnectAttempts && config.maxReconnectAttempts < 0) {
        errors.push('Invalid maxReconnectAttempts: must be >= 0');
    }
    return errors;
}
/**
 * Check if a string is a valid URL
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=config.js.map