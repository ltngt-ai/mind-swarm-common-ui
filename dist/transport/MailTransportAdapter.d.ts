/**
 * Mail Transport Adapter
 */
import { WebSocketTransport } from './WebSocketTransport.js';
import type { WebSocketTransportConfig } from './WebSocketTransport.js';
import type { Mail, MailTransport as IMailTransport } from './types.js';
/**
 * Mail-specific WebSocket transport configuration
 */
export interface MailTransportConfig extends WebSocketTransportConfig {
    defaultFrom?: string;
    defaultTimeout?: number;
}
/**
 * Adapter to convert WebSocketTransport to Mail-based interface
 */
export declare class MailTransportAdapter extends WebSocketTransport implements IMailTransport {
    private mailHandlers;
    private defaultFrom;
    private userEmail?;
    private uiAgentEmail?;
    constructor(config: MailTransportConfig);
    /**
     * Send mail and wait for response
     */
    sendMail(mail: Mail): Promise<Mail>;
    /**
     * Register mail handler
     */
    onMail(handler: (mail: Mail) => void): void;
    /**
     * Unregister mail handler
     */
    offMail(handler: (mail: Mail) => void): void;
    /**
     * Set user email
     */
    setUserEmail(email: string): void;
    /**
     * Get user email
     */
    getUserEmail(): string | undefined;
    /**
     * Set UI agent email
     */
    setUiAgentEmail(email: string): void;
    /**
     * Get UI agent email
     */
    getUiAgentEmail(): string | undefined;
    /**
     * Handle incoming mail messages
     */
    private handleMailMessage;
    /**
     * Emit mail to all handlers
     */
    private emitMail;
    /**
     * Send identity message
     */
    private sendIdentity;
    /**
     * Send mail with convenience parameters
     */
    sendMailTo(to: string, subject: string, body: string, options?: {
        inReplyTo?: string;
        timeout?: number;
        headers?: Record<string, string>;
    }): Promise<Mail>;
}
//# sourceMappingURL=MailTransportAdapter.d.ts.map