/**
 * WebSocket Transport Implementation
 */

import WebSocket from 'ws';
import { BaseTransport } from './BaseTransport.js';
import { TransportEvent, TransportState } from './types.js';
import type { 
  TransportConfig, 
  TransportMessage, 
  TransportResponse
} from './types.js';

export interface WebSocketTransportConfig extends TransportConfig {
  url: string;
  protocols?: string | string[];
  headers?: Record<string, string>;
  heartbeatInterval?: number;
}

/**
 * WebSocket-based transport implementation
 */
export class WebSocketTransport extends BaseTransport {
  protected ws: WebSocket | null = null;
  protected reconnectAttempts = 0;
  protected reconnectTimer: NodeJS.Timeout | null = null;
  protected heartbeatTimer: NodeJS.Timeout | null = null;
  protected pendingRequests = new Map<string, {
    resolve: (response: TransportResponse) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();

  constructor(config: WebSocketTransportConfig) {
    super(config);
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.state === TransportState.CONNECTED || this.state === TransportState.CONNECTING) {
      this.log('Already connected or connecting');
      return;
    }

    this.setState(TransportState.CONNECTING);
    this.reconnectAttempts = 0;

    try {
      await this.createConnection();
    } catch (error) {
      this.setState(TransportState.ERROR);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    if (this.state === TransportState.DISCONNECTED) {
      return;
    }

    this.setState(TransportState.DISCONNECTING);
    this.clearTimers();

    // Cancel pending requests
    for (const [, request] of this.pendingRequests) {
      clearTimeout(request.timeout);
      request.reject(new Error('Transport disconnected'));
    }
    this.pendingRequests.clear();

    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }

    this.setState(TransportState.DISCONNECTED);
  }

  /**
   * Send message and wait for response
   */
  async send(message: TransportMessage): Promise<TransportResponse> {
    if (!this.isConnected()) {
      throw new Error('Transport not connected');
    }

    const messageId = message.id || this.generateId();
    const timeout = this.config.timeout || 30000;

    return new Promise<TransportResponse>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(messageId);
        reject(new Error(`Request ${messageId} timed out`));
      }, timeout);

      this.pendingRequests.set(messageId, {
        resolve,
        reject,
        timeout: timeoutHandle
      });

      const outgoingMessage = {
        ...message,
        id: messageId,
        timestamp: new Date().toISOString()
      };

      this.log('Sending message:', outgoingMessage);
      
      try {
        this.ws!.send(JSON.stringify(outgoingMessage));
      } catch (error) {
        this.pendingRequests.delete(messageId);
        clearTimeout(timeoutHandle);
        reject(error);
      }
    });
  }

  /**
   * Create WebSocket connection
   */
  protected async createConnection(): Promise<void> {
    const config = this.config as WebSocketTransportConfig;
    
    return new Promise((resolve, reject) => {
      try {
        this.log(`Connecting to ${config.url}`);
        
        this.ws = new WebSocket(config.url, config.protocols, {
          headers: config.headers
        });

        const connectTimeout = setTimeout(() => {
          if (this.ws) {
            this.ws.close();
          }
          reject(new Error('Connection timeout'));
        }, this.config.timeout || 30000);

        this.ws.on('open', () => {
          clearTimeout(connectTimeout);
          this.log('Connected');
          this.setState(TransportState.CONNECTED);
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit(TransportEvent.CONNECTED);
          resolve();
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
          clearTimeout(connectTimeout);
          this.log(`Connection closed: ${code} - ${reason}`);
          this.handleDisconnect();
        });

        this.ws.on('error', (error: Error) => {
          clearTimeout(connectTimeout);
          this.logError('WebSocket error:', error);
          this.emit(TransportEvent.ERROR, error);
          
          if (this.state === TransportState.CONNECTING) {
            reject(error);
          }
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data);
        });

        this.ws.on('ping', () => {
          this.log('Received ping');
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.pong();
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  protected handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());
      this.log('Received message:', JSON.stringify(message).substring(0, 200));

      // Check if this is a response to a pending request
      if (message.id && this.pendingRequests.has(message.id)) {
        const request = this.pendingRequests.get(message.id)!;
        this.pendingRequests.delete(message.id);
        clearTimeout(request.timeout);

        const response: TransportResponse = {
          id: message.id,
          success: message.success !== false,
          payload: message.payload || message,
          error: message.error,
          metadata: message.metadata
        };

        request.resolve(response);
      } else {
        // Emit as general message
        this.emit(TransportEvent.MESSAGE, message);
      }
    } catch (error) {
      this.logError('Failed to parse message:', error);
    }
  }

  /**
   * Handle disconnection
   */
  protected handleDisconnect(): void {
    this.clearTimers();
    const wasConnected = this.state === TransportState.CONNECTED;
    this.setState(TransportState.DISCONNECTED);

    // Cancel pending requests
    for (const [, request] of this.pendingRequests) {
      clearTimeout(request.timeout);
      request.reject(new Error('Connection lost'));
    }
    this.pendingRequests.clear();

    // Attempt reconnection if configured
    if (wasConnected && this.config.reconnect) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  protected scheduleReconnect(): void {
    const config = this.config as WebSocketTransportConfig;
    
    if (this.reconnectAttempts >= (config.maxReconnectAttempts || 5)) {
      this.logError('Max reconnection attempts reached');
      this.setState(TransportState.ERROR);
      return;
    }

    const delay = config.reconnectInterval || 5000;
    this.reconnectAttempts++;
    
    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        this.logError('Reconnection failed:', error);
        this.handleDisconnect();
      });
    }, delay);
  }

  /**
   * Start heartbeat
   */
  protected startHeartbeat(): void {
    const config = this.config as WebSocketTransportConfig;
    const interval = config.heartbeatInterval || 30000;

    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, interval);
  }

  /**
   * Clear all timers
   */
  protected clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}