/**
 * Base Transport Implementation
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { TransportEvent, TransportState } from './types.js';
import type { 
  Transport, 
  TransportConfig, 
  TransportMessage, 
  TransportResponse
} from './types.js';

/**
 * Abstract base class for all transport implementations
 */
export abstract class BaseTransport extends EventEmitter implements Transport {
  protected state: TransportState = TransportState.DISCONNECTED;
  protected config: TransportConfig;
  protected debug: boolean;

  constructor(config: TransportConfig = {}) {
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
  getState(): TransportState {
    return this.state;
  }

  /**
   * Check if transport is connected
   */
  isConnected(): boolean {
    return this.state === TransportState.CONNECTED;
  }

  /**
   * Get current configuration
   */
  getConfig(): TransportConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TransportConfig>): void {
    this.config = { ...this.config, ...config };
    this.debug = this.config.debug || false;
    this.onConfigUpdate(config);
  }

  /**
   * Set connection state and emit event
   */
  protected setState(state: TransportState): void {
    const oldState = this.state;
    this.state = state;
    
    if (oldState !== state) {
      this.emit(TransportEvent.STATE_CHANGE, { from: oldState, to: state });
      
      // Emit specific events
      if (state === TransportState.CONNECTED) {
        this.emit(TransportEvent.CONNECTED);
      } else if (state === TransportState.DISCONNECTED) {
        this.emit(TransportEvent.DISCONNECTED);
      }
    }
  }

  /**
   * Log debug messages
   */
  protected log(message: string, ...args: any[]): void {
    if (this.debug) {
      console.log(`[${this.constructor.name}] ${message}`, ...args);
    }
  }

  /**
   * Log error messages
   */
  protected logError(message: string, error?: any): void {
    console.error(`[${this.constructor.name}] ${message}`, error);
  }

  /**
   * Generate unique message ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create timeout promise
   */
  protected createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), ms);
    });
  }

  /**
   * Override these in subclasses
   */
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract send(message: TransportMessage): Promise<TransportResponse>;

  /**
   * Optional: Override to handle config updates
   */
  protected onConfigUpdate(_config: Partial<TransportConfig>): void {
    // Subclasses can override this
  }
}