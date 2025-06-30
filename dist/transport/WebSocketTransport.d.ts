/**
 * WebSocket Transport Implementation
 */
import { BaseTransport } from './BaseTransport.js';
import type { TransportConfig, TransportMessage, TransportResponse } from './types.js';
export interface WebSocketTransportConfig extends TransportConfig {
    url: string;
    protocols?: string | string[];
    headers?: Record<string, string>;
    heartbeatInterval?: number;
}
/**
 * WebSocket-based transport implementation
 */
export declare class WebSocketTransport extends BaseTransport {
    protected ws: any | null;
    protected reconnectAttempts: number;
    protected reconnectTimer: NodeJS.Timeout | null;
    protected heartbeatTimer: NodeJS.Timeout | null;
    protected pendingRequests: Map<string, {
        resolve: (response: TransportResponse) => void;
        reject: (error: Error) => void;
        timeout: NodeJS.Timeout;
    }>;
    constructor(config: WebSocketTransportConfig);
    /**
     * Connect to WebSocket server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from WebSocket server
     */
    disconnect(): Promise<void>;
    /**
     * Send message and wait for response
     */
    send(message: TransportMessage): Promise<TransportResponse>;
    /**
     * Create WebSocket connection
     */
    protected createConnection(): Promise<void>;
    /**
     * Handle incoming messages
     */
    protected handleMessage(data: any): void;
    /**
     * Handle disconnection
     */
    protected handleDisconnect(): void;
    /**
     * Schedule reconnection attempt
     */
    protected scheduleReconnect(): void;
    /**
     * Start heartbeat
     */
    protected startHeartbeat(): void;
    /**
     * Clear all timers
     */
    protected clearTimers(): void;
}
//# sourceMappingURL=WebSocketTransport.d.ts.map