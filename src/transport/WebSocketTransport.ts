/**
 * WebSocket Transport Implementation
 */

// Use native WebSocket in browser, ws library in Node.js
let WebSocketImpl: any;

if (typeof window !== 'undefined' && window.WebSocket) {
  // Browser environment
  WebSocketImpl = window.WebSocket;
} else {
  // Node.js environment - will be loaded asynchronously
  WebSocketImpl = null;
}

// WebSocket constants (same in both environments)
const WS_READY_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};
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
  protected ws: any | null = null;
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
      // Remove listeners (Node.js ws has removeAllListeners, browser doesn't)
      if (typeof window === 'undefined' && this.ws.removeAllListeners) {
        this.ws.removeAllListeners();
      }
      if (this.ws.readyState === WS_READY_STATE.OPEN) {
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
    
    return new Promise(async (resolve, reject) => {
      try {
        this.log(`Connecting to ${config.url}`);
        
        // Browser WebSocket constructor: new WebSocket(url, protocols)
        // Node.js ws constructor: new WebSocket(url, protocols, options)
        if (typeof window !== 'undefined') {
          // Browser environment - no options parameter
          this.ws = new WebSocketImpl(config.url, config.protocols);
        } else {
          // Node.js environment - load ws dynamically
          if (!WebSocketImpl) {
            const wsModule = await import('ws');
            WebSocketImpl = wsModule.default;
          }
          // Can pass options in Node.js
          this.ws = new WebSocketImpl(config.url, config.protocols, {
            headers: config.headers
          });
        }

        const connectTimeout = setTimeout(() => {
          if (this.ws) {
            this.ws.close();
          }
          reject(new Error('Connection timeout'));
        }, this.config.timeout || 30000);

        // Handle events differently for browser vs Node.js
        if (typeof window !== 'undefined') {
          // Browser WebSocket events
          this.ws.addEventListener('open', () => {
            clearTimeout(connectTimeout);
            this.log('Connected');
            this.setState(TransportState.CONNECTED);
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.emit(TransportEvent.CONNECTED);
            resolve();
          });

          this.ws.addEventListener('close', (event: CloseEvent) => {
            clearTimeout(connectTimeout);
            this.log(`Connection closed: ${event.code} - ${event.reason}`);
            this.handleDisconnect();
          });

          this.ws.addEventListener('error', (error: Event) => {
            clearTimeout(connectTimeout);
            this.logError('WebSocket error:', error);
            this.emit(TransportEvent.ERROR, error);
            
            if (this.state === TransportState.CONNECTING) {
              reject(new Error('WebSocket connection failed'));
            }
          });
        } else {
          // Node.js ws events
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
        }

        // Handle message events differently for browser vs Node.js
        if (typeof window !== 'undefined') {
          // Browser WebSocket uses 'message' event with MessageEvent
          this.ws.addEventListener('message', (event: MessageEvent) => {
            this.handleMessage(event.data);
          });
        } else {
          // Node.js ws uses 'message' event with raw data
          this.ws.on('message', (data: any) => {
            this.handleMessage(data);
          });

          // Ping/pong is only available in Node.js ws
          this.ws.on('ping', () => {
            this.log('Received ping');
            if (this.ws && this.ws.readyState === WS_READY_STATE.OPEN) {
              this.ws.pong();
            }
          });
        }

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  protected handleMessage(data: any): void {
    try {
      // Handle different data types from browser vs Node.js
      let messageText: string;
      if (typeof data === 'string') {
        messageText = data;
      } else if (data instanceof ArrayBuffer) {
        messageText = new TextDecoder().decode(data);
      } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
        messageText = data.toString();
      } else {
        messageText = data.toString();
      }
      
      const message = JSON.parse(messageText);
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
      if (this.ws && this.ws.readyState === WS_READY_STATE.OPEN) {
        if (typeof window !== 'undefined') {
          // Browser: Send a heartbeat message instead of ping
          this.ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
        } else {
          // Node.js: Use ping/pong
          this.ws.ping();
        }
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