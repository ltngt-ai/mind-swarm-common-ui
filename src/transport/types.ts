/**
 * Transport layer types and interfaces
 */

import type { Mail } from '../types/mail.js';

// Re-export Mail type for use in this module
export type { Mail };

/**
 * Transport connection states
 */
export enum TransportState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error'
}

/**
 * Base transport message format
 */
export interface TransportMessage {
  id: string;
  type: string;
  payload: any;
  metadata?: Record<string, any>;
}

/**
 * Transport response format
 */
export interface TransportResponse {
  id: string;
  success: boolean;
  payload?: any;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Transport configuration options
 */
export interface TransportConfig {
  url?: string;
  timeout?: number;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

/**
 * Transport event types
 */
export enum TransportEvent {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  MESSAGE = 'message',
  ERROR = 'error',
  STATE_CHANGE = 'state_change'
}

/**
 * Abstract transport interface
 */
export interface Transport {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getState(): TransportState;
  
  // Message handling
  send(message: TransportMessage): Promise<TransportResponse>;
  
  // Event handling
  on(event: TransportEvent | string, handler: Function): void;
  off(event: TransportEvent | string, handler: Function): void;
  once(event: TransportEvent | string, handler: Function): void;
  
  // Configuration
  getConfig(): TransportConfig;
  updateConfig(config: Partial<TransportConfig>): void;
}

/**
 * Mail transport extends base transport with mail-specific functionality
 */
export interface MailTransport extends Transport {
  sendMail(mail: Mail): Promise<Mail>;
  onMail(handler: (mail: Mail) => void): void;
  offMail(handler: (mail: Mail) => void): void;
}