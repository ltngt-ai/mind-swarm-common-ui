/**
 * Base Service Class
 */
import { MailTransportAdapter } from '../transport/MailTransportAdapter.js';
import { MailHandlerRegistry } from '../handlers/MailHandlerRegistry.js';
import { ResponseDecoder } from '../handlers/ResponseDecoder.js';
import { UI_OPERATION_TIMEOUT_MS, DEFAULT_UI_AGENT_EMAIL } from '../transport/constants.js';
/**
 * Base class for services that communicate via mail
 */
export class ServiceBase {
    transport;
    uiAgentEmail;
    defaultTimeout;
    handlers;
    decoder;
    constructor(config) {
        this.transport = config.transport;
        this.uiAgentEmail = config.uiAgentEmail || DEFAULT_UI_AGENT_EMAIL;
        this.defaultTimeout = config.timeout || UI_OPERATION_TIMEOUT_MS;
        this.handlers = new MailHandlerRegistry();
        this.decoder = new ResponseDecoder();
    }
    /**
     * Ensure transport is connected
     */
    async ensureConnected() {
        if (!this.transport.isConnected()) {
            await this.transport.connect();
        }
    }
    /**
     * Ensure user is authenticated
     */
    async ensureAuthenticated() {
        await this.ensureConnected();
        // Use transport's ensureAuthenticated which waits for identity confirmation
        if (typeof this.transport.ensureAuthenticated === 'function') {
            await this.transport.ensureAuthenticated();
        }
        else {
            const userEmail = this.transport.getUserEmail();
            if (!userEmail) {
                throw new Error('Not authenticated. Please login first.');
            }
        }
    }
    /**
     * Ensure UI agent is available
     */
    async ensureUiAgent() {
        await this.ensureAuthenticated();
        // Update UI agent email if transport has it
        const transportUiEmail = this.transport.getUiAgentEmail();
        if (transportUiEmail) {
            this.uiAgentEmail = transportUiEmail;
        }
    }
    /**
     * Send mail and wait for response
     */
    async sendAndWait(to, subject, body, options) {
        const timeout = options?.timeout || this.defaultTimeout;
        const messageId = this.generateMessageId();
        // Create response promise
        const responsePromise = new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                cleanup();
                reject(new Error(`Request timeout: ${subject}`));
            }, timeout);
            const cleanup = () => {
                clearTimeout(timer);
                this.transport.offMail(mailHandler);
            };
            const mailHandler = (mail) => {
                // Check if this is the response we're waiting for
                if (this.isResponse(mail, messageId, options?.expectSubject || subject)) {
                    cleanup();
                    resolve(mail);
                }
            };
            this.transport.onMail(mailHandler);
        });
        // Send the mail
        const mailOptions = {
            timeout,
            headers: {
                ...options?.headers,
                'Message-ID': messageId
            }
        };
        if (options?.inReplyTo) {
            mailOptions.inReplyTo = options.inReplyTo;
        }
        await this.transport.sendMailTo(to, subject, body, mailOptions);
        // Wait for response
        return responsePromise;
    }
    /**
     * Send mail to UI agent and wait for response
     */
    async sendToUiAgent(subject, body, options) {
        await this.ensureUiAgent();
        return this.sendAndWait(this.uiAgentEmail, subject, body, options);
    }
    /**
     * Check if mail is a response to our request
     */
    isResponse(mail, messageId, expectedSubject) {
        // Check if it's in reply to our message
        if (mail.in_reply_to === messageId) {
            return true;
        }
        // Check if subject matches expected pattern
        if (typeof expectedSubject === 'string') {
            // For string, check if response subject contains original
            const responsePattern = `Response: ${expectedSubject}`;
            const rePattern = `Re: ${expectedSubject}`;
            return mail.subject === responsePattern ||
                mail.subject === rePattern ||
                mail.subject.includes(expectedSubject);
        }
        else {
            // For regex, test directly
            return expectedSubject.test(mail.subject);
        }
    }
    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@mindswarm.ai>`;
    }
    /**
     * Parse response using decoder
     */
    parseResponse(mail) {
        return this.decoder.decode(mail);
    }
    /**
     * Check if response indicates success
     */
    isSuccessResponse(mail) {
        return ResponseDecoder.extractSuccess(mail);
    }
    /**
     * Extract error from response
     */
    extractError(mail) {
        return ResponseDecoder.extractError(mail);
    }
    /**
     * Get UI agent email
     */
    getUiAgentEmail() {
        return this.uiAgentEmail;
    }
    /**
     * Set UI agent email
     */
    setUiAgentEmail(email) {
        this.uiAgentEmail = email;
        this.transport.setUiAgentEmail(email);
    }
}
//# sourceMappingURL=ServiceBase.js.map