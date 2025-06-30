/**
 * Configuration management utilities
 */
export interface SharedConfig {
    websocketUrl?: string;
    apiBaseUrl?: string;
    timeout?: number;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    debugMode?: boolean;
}
/**
 * Default configuration values
 */
export declare const defaultConfig: Required<SharedConfig>;
/**
 * Merge configuration with defaults
 */
export declare function mergeConfig(config?: SharedConfig): Required<SharedConfig>;
/**
 * Get configuration from environment variables
 */
export declare function getEnvConfig(): SharedConfig;
/**
 * Validate configuration
 */
export declare function validateConfig(config: SharedConfig): string[];
//# sourceMappingURL=config.d.ts.map