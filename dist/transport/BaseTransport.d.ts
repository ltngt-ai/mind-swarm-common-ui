/**
 * Base Transport Implementation
 */
import { EventEmitter } from 'events';
import { TransportState } from './types.js';
import type { Transport, TransportConfig, TransportMessage, TransportResponse } from './types.js';
/**
 * Abstract base class for all transport implementations
 */
export declare abstract class BaseTransport extends EventEmitter implements Transport {
    protected state: TransportState;
    protected config: TransportConfig;
    protected debug: boolean;
    constructor(config?: TransportConfig);
    /**
     * Get current connection state
     */
    getState(): TransportState;
    /**
     * Check if transport is connected
     */
    isConnected(): boolean;
    /**
     * Get current configuration
     */
    getConfig(): TransportConfig;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<TransportConfig>): void;
    /**
     * Set connection state and emit event
     */
    protected setState(state: TransportState): void;
    /**
     * Log debug messages
     */
    protected log(message: string, ...args: any[]): void;
    /**
     * Log error messages
     */
    protected logError(message: string, error?: any): void;
    /**
     * Generate unique message ID
     */
    protected generateId(): string;
    /**
     * Create timeout promise
     */
    protected createTimeout(ms: number): Promise<never>;
    /**
     * Override these in subclasses
     */
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract send(message: TransportMessage): Promise<TransportResponse>;
    /**
     * Optional: Override to handle config updates
     */
    protected onConfigUpdate(_config: Partial<TransportConfig>): void;
}
//# sourceMappingURL=BaseTransport.d.ts.map