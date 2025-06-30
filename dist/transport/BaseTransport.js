/**
 * Base Transport Implementation
 */
import { EventEmitter } from '../utils/EventEmitter.js';
import { TransportEvent, TransportState } from './types.js';
/**
 * Abstract base class for all transport implementations
 */
export class BaseTransport extends EventEmitter {
    state = TransportState.DISCONNECTED;
    config;
    debug;
    constructor(config = {}) {
        super();
        this.config = {
            timeout: 30000,
            reconnect: true,
            reconnectInterval: 5000,
            maxReconnectAttempts: 5,
            debug: false,
            ...config
        };
        this.debug = this.config.debug || false;
    }
    /**
     * Get current connection state
     */
    getState() {
        return this.state;
    }
    /**
     * Check if transport is connected
     */
    isConnected() {
        return this.state === TransportState.CONNECTED;
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.debug = this.config.debug || false;
        this.onConfigUpdate(config);
    }
    /**
     * Set connection state and emit event
     */
    setState(state) {
        const oldState = this.state;
        this.state = state;
        if (oldState !== state) {
            this.emit(TransportEvent.STATE_CHANGE, { from: oldState, to: state });
            // Emit specific events
            if (state === TransportState.CONNECTED) {
                this.emit(TransportEvent.CONNECTED);
            }
            else if (state === TransportState.DISCONNECTED) {
                this.emit(TransportEvent.DISCONNECTED);
            }
        }
    }
    /**
     * Log debug messages
     */
    log(message, ...args) {
        if (this.debug) {
            console.log(`[${this.constructor.name}] ${message}`, ...args);
        }
    }
    /**
     * Log error messages
     */
    logError(message, error) {
        console.error(`[${this.constructor.name}] ${message}`, error);
    }
    /**
     * Generate unique message ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Create timeout promise
     */
    createTimeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Operation timed out')), ms);
        });
    }
    /**
     * Optional: Override to handle config updates
     */
    onConfigUpdate(_config) {
        // Subclasses can override this
    }
}
//# sourceMappingURL=BaseTransport.js.map