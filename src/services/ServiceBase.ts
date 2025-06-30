/**
 * Base Service Class
 */

import { MailTransportAdapter } from '../transport/MailTransportAdapter.js';
import type { Mail } from '../types/mail.js';
import { MailHandlerRegistry } from '../handlers/MailHandlerRegistry.js';
import { ResponseDecoder } from '../handlers/ResponseDecoder.js';
import { UI_OPERATION_TIMEOUT_MS, DEFAULT_UI_AGENT_EMAIL } from '../transport/constants.js';

/**
 * Service configuration
 */
export interface ServiceConfig {
  transport: MailTransportAdapter;
  uiAgentEmail?: string;
  timeout?: number;
}

/**
 * Base class for services that communicate via mail
 */
export abstract class ServiceBase {
  protected transport: MailTransportAdapter;
  protected uiAgentEmail: string;
  protected defaultTimeout: number;
  protected handlers: MailHandlerRegistry;
  protected decoder: ResponseDecoder;

  constructor(config: ServiceConfig) {
    this.transport = config.transport;
    this.uiAgentEmail = config.uiAgentEmail || DEFAULT_UI_AGENT_EMAIL;
    this.defaultTimeout = config.timeout || UI_OPERATION_TIMEOUT_MS;
    this.handlers = new MailHandlerRegistry();
    this.decoder = new ResponseDecoder();
  }

  /**
   * Ensure transport is connected
   */
  protected async ensureConnected(): Promise<void> {
    if (!this.transport.isConnected()) {
      await this.transport.connect();
    }
  }

  /**
   * Ensure user is authenticated
   */
  protected async ensureAuthenticated(): Promise<void> {
    await this.ensureConnected();
    
    // Use transport's ensureAuthenticated which waits for identity confirmation
    if (typeof (this.transport as any).ensureAuthenticated === 'function') {
      await (this.transport as any).ensureAuthenticated();
    } else {
      const userEmail = this.transport.getUserEmail();
      if (!userEmail) {
        throw new Error('Not authenticated. Please login first.');
      }
    }
  }

  /**
   * Ensure UI agent is available
   */
  protected async ensureUiAgent(): Promise<void> {
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
  protected async sendAndWait(
    to: string,
    subject: string,
    body: string,
    options?: {
      timeout?: number;
      inReplyTo?: string;
      headers?: Record<string, string>;
      expectSubject?: string | RegExp;
    }
  ): Promise<Mail> {
    const timeout = options?.timeout || this.defaultTimeout;
    const messageId = this.generateMessageId();

    // Create response promise
    const responsePromise = new Promise<Mail>((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Request timeout: ${subject}`));
      }, timeout);

      const cleanup = () => {
        clearTimeout(timer);
        this.transport.offMail(mailHandler);
      };

      const mailHandler = (mail: Mail) => {
        // Check if this is the response we're waiting for
        if (this.isResponse(mail, messageId, options?.expectSubject || subject)) {
          cleanup();
          resolve(mail);
        }
      };

      this.transport.onMail(mailHandler);
    });

    // Send the mail
    const mailOptions: Parameters<typeof this.transport.sendMailTo>[3] = {
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
  protected async sendToUiAgent(
    subject: string,
    body: string,
    options?: {
      timeout?: number;
      headers?: Record<string, string>;
      expectSubject?: string | RegExp;
    }
  ): Promise<Mail> {
    await this.ensureUiAgent();
    return this.sendAndWait(this.uiAgentEmail, subject, body, options);
  }

  /**
   * Check if mail is a response to our request
   */
  protected isResponse(mail: Mail, messageId: string, expectedSubject: string | RegExp): boolean {
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
    } else {
      // For regex, test directly
      return expectedSubject.test(mail.subject);
    }
  }

  /**
   * Generate unique message ID
   */
  protected generateMessageId(): string {
    return `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@mindswarm.ai>`;
  }

  /**
   * Parse response using decoder
   */
  protected parseResponse<T = any>(mail: Mail): T {
    return this.decoder.decode(mail);
  }

  /**
   * Check if response indicates success
   */
  protected isSuccessResponse(mail: Mail): boolean {
    return ResponseDecoder.extractSuccess(mail);
  }

  /**
   * Extract error from response
   */
  protected extractError(mail: Mail): string | null {
    return ResponseDecoder.extractError(mail);
  }

  /**
   * Get UI agent email
   */
  getUiAgentEmail(): string {
    return this.uiAgentEmail;
  }

  /**
   * Set UI agent email
   */
  setUiAgentEmail(email: string): void {
    this.uiAgentEmail = email;
    this.transport.setUiAgentEmail(email);
  }
}