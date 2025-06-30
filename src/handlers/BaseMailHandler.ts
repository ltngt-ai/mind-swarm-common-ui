/**
 * Base Mail Handler Implementation
 */

import type { Mail } from '../types/mail.js';
import type { 
  MailHandler, 
  MailHandlerConfig, 
  MailHandlerResult, 
  MailMatcher 
} from './types.js';

/**
 * Abstract base class for mail handlers
 */
export abstract class BaseMailHandler implements MailHandler {
  readonly id: string;
  readonly priority: number;
  protected matcher: MailMatcher | undefined;

  constructor(config: MailHandlerConfig) {
    this.id = config.id;
    this.priority = config.priority || 0;
    this.matcher = config.matcher;
  }

  /**
   * Check if handler can process mail using matcher
   */
  canHandle(mail: Mail): boolean {
    if (!this.matcher) {
      return this.customCanHandle(mail);
    }

    // Check subject
    if (this.matcher.subject) {
      if (!this.matchField(mail.subject, this.matcher.subject)) {
        return false;
      }
    }

    // Check from
    if (this.matcher.from) {
      if (!this.matchField(mail.from_address, this.matcher.from)) {
        return false;
      }
    }

    // Check to
    if (this.matcher.to) {
      if (!this.matchField(mail.to_address, this.matcher.to)) {
        return false;
      }
    }

    // Check body
    if (this.matcher.body) {
      if (!this.matchField(mail.body || '', this.matcher.body)) {
        return false;
      }
    }

    // Check headers
    if (this.matcher.headers && mail.headers) {
      for (const [key, pattern] of Object.entries(this.matcher.headers)) {
        const value = mail.headers[key];
        if (!value || !this.matchField(value, pattern)) {
          return false;
        }
      }
    }

    // All checks passed, additionally check custom logic
    return this.customCanHandle(mail);
  }

  /**
   * Override for custom matching logic
   */
  protected customCanHandle(_mail: Mail): boolean {
    return true;
  }

  /**
   * Match field against pattern
   */
  protected matchField(field: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return field.includes(pattern);
    } else {
      return pattern.test(field);
    }
  }

  /**
   * Abstract handle method to be implemented by subclasses
   */
  abstract handle(mail: Mail): Promise<MailHandlerResult>;

  /**
   * Helper method to create successful result
   */
  protected success(data?: any): MailHandlerResult {
    return { handled: true, data };
  }

  /**
   * Helper method to create error result
   */
  protected error(error: Error): MailHandlerResult {
    return { handled: true, error };
  }

  /**
   * Helper method to indicate not handled
   */
  protected notHandled(): MailHandlerResult {
    return { handled: false };
  }
}