/**
 * Mail Transport Adapter
 */
import { WebSocketTransport } from './WebSocketTransport.js';
import { TransportEvent } from './types.js';
/**
 * Adapter to convert WebSocketTransport to Mail-based interface
 */
export class MailTransportAdapter extends WebSocketTransport {
    mailHandlers = new Set();
    defaultFrom;
    userEmail;
    uiAgentEmail;
    constructor(config) {
        super(config);
        this.defaultFrom = config.defaultFrom || 'user@mindswarm.ai';
        // Listen for mail messages
        this.on(TransportEvent.MESSAGE, this.handleMailMessage.bind(this));
        // Listen for connection event
        this.on(TransportEvent.CONNECTED, () => {
            this.log(`MailTransportAdapter: Connected event received. User email: ${this.userEmail}`);
            // Always send identity - server will respond with correct email
            this.sendIdentity();
        });
    }
    /**
     * Send mail and wait for response
     */
    async sendMail(mail) {
        // Server expects this exact format
        const message = {
            type: 'mail',
            mail: {
                headers: {
                    'To': mail.to_address,
                    'From': mail.from_address,
                    'Subject': mail.subject,
                    'Message-ID': mail.message_id || this.generateId()
                },
                body: mail.body
            }
        };
        // Send directly via WebSocket
        const ws = this.ws;
        if (ws && ws.readyState === 1) {
            this.log(`Sending mail message: ${JSON.stringify(message)}`);
            ws.send(JSON.stringify(message));
        }
        else {
            throw new Error('WebSocket not connected');
        }
        // For now, return the original mail (we'll handle responses later)
        return mail;
    }
    /**
     * Register mail handler
     */
    onMail(handler) {
        this.mailHandlers.add(handler);
    }
    /**
     * Unregister mail handler
     */
    offMail(handler) {
        this.mailHandlers.delete(handler);
    }
    /**
     * Set user email
     */
    setUserEmail(email) {
        this.userEmail = email;
        this.defaultFrom = email;
    }
    /**
     * Get user email
     */
    getUserEmail() {
        return this.userEmail;
    }
    /**
     * Set UI agent email
     */
    setUiAgentEmail(email) {
        this.uiAgentEmail = email;
    }
    /**
     * Get UI agent email
     */
    getUiAgentEmail() {
        return this.uiAgentEmail;
    }
    /**
     * Handle incoming mail messages
     */
    handleMailMessage(message) {
        this.log(`Received message type: ${message.type}`);
        // Check if this is a mail message
        if (message.type === 'mail' && message.mail) {
            const mail = message.mail;
            this.emitMail(mail);
        }
        else if (message.type === 'mail_notification') {
            // Handle mail notification - convert to Mail format
            const mail = {
                message_id: message.message_id,
                from_address: message.from,
                to_address: message.to,
                subject: message.subject,
                body: message.body,
                timestamp: message.timestamp || new Date().toISOString(),
                in_reply_to: message.in_reply_to,
                headers: {}
            };
            this.emitMail(mail);
        }
        else if (message.type === 'identity_confirmed') {
            // Update user identity
            if (message.email_address) {
                this.userEmail = message.email_address;
                this.defaultFrom = message.email_address; // Update default from address
                this.log(`Identity confirmed: ${this.userEmail}`);
            }
            if (message.ui_agent_email) {
                this.uiAgentEmail = message.ui_agent_email;
                this.log(`UI Agent: ${this.uiAgentEmail}`);
            }
        }
        else {
            this.log(`Unhandled message: ${JSON.stringify(message).substring(0, 200)}`);
        }
    }
    /**
     * Emit mail to all handlers
     */
    emitMail(mail) {
        for (const handler of this.mailHandlers) {
            try {
                handler(mail);
            }
            catch (error) {
                this.logError('Mail handler error:', error);
            }
        }
    }
    /**
     * Send identity message
     */
    sendIdentity() {
        // Always send identity message, even with empty email
        // The server will respond with the correct email for authenticated users
        const message = {
            type: 'set_identity',
            email_address: this.userEmail || ''
        };
        this.log(`Sending identity message: ${JSON.stringify(message)}`);
        // Access the underlying WebSocket if available
        const ws = this.ws;
        if (ws && ws.readyState === 1) { // OPEN
            ws.send(JSON.stringify(message));
            this.log('Identity message sent successfully');
        }
        else {
            this.logError(`WebSocket not available or not open. State: ${ws?.readyState}`);
        }
    }
    /**
     * Send mail with convenience parameters
     */
    async sendMailTo(to, subject, body, options) {
        const mail = {
            message_id: this.generateId(),
            from_address: this.defaultFrom,
            to_address: to,
            subject,
            body,
            timestamp: new Date().toISOString(),
            headers: options?.headers || {}
        };
        if (options?.inReplyTo) {
            mail.in_reply_to = options.inReplyTo;
        }
        // Add timeout handling if specified
        if (options?.timeout) {
            const timeoutPromise = this.createTimeout(options.timeout);
            return Promise.race([
                this.sendMail(mail),
                timeoutPromise.then(() => {
                    throw new Error(`Mail timeout: ${subject}`);
                })
            ]);
        }
        return this.sendMail(mail);
    }
}
//# sourceMappingURL=MailTransportAdapter.js.map