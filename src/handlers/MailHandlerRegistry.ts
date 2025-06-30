/**
 * Mail Handler Registry
 */

import type { Mail } from '../types/mail.js';
import type { MailHandler, MailHandlerResult } from './types.js';

/**
 * Registry for managing mail handlers
 */
export class MailHandlerRegistry {
  private handlers: Map<string, MailHandler> = new Map();
  private sortedHandlers: MailHandler[] = [];

  /**
   * Register a mail handler
   */
  register(handler: MailHandler): void {
    if (this.handlers.has(handler.id)) {
      throw new Error(`Handler with id '${handler.id}' already registered`);
    }

    this.handlers.set(handler.id, handler);
    this.updateSortedHandlers();
  }

  /**
   * Unregister a mail handler
   */
  unregister(handlerId: string): boolean {
    const deleted = this.handlers.delete(handlerId);
    if (deleted) {
      this.updateSortedHandlers();
    }
    return deleted;
  }

  /**
   * Get handler by ID
   */
  getHandler(handlerId: string): MailHandler | undefined {
    return this.handlers.get(handlerId);
  }

  /**
   * Get all registered handlers
   */
  getAllHandlers(): MailHandler[] {
    return [...this.sortedHandlers];
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.sortedHandlers = [];
  }

  /**
   * Process mail through all applicable handlers
   */
  async process(mail: Mail): Promise<MailHandlerResult[]> {
    const results: MailHandlerResult[] = [];

    for (const handler of this.sortedHandlers) {
      try {
        if (handler.canHandle(mail)) {
          const result = await handler.handle(mail);
          results.push(result);

          // If handler fully processed the mail, stop processing
          if (result.handled && !result.error) {
            break;
          }
        }
      } catch (error) {
        results.push({
          handled: false,
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    }

    return results;
  }

  /**
   * Process mail and return first successful result
   */
  async processOne(mail: Mail): Promise<MailHandlerResult | null> {
    for (const handler of this.sortedHandlers) {
      try {
        if (handler.canHandle(mail)) {
          const result = await handler.handle(mail);
          if (result.handled && !result.error) {
            return result;
          }
        }
      } catch (error) {
        // Continue to next handler
      }
    }

    return null;
  }

  /**
   * Find all handlers that can handle the given mail
   */
  findHandlers(mail: Mail): MailHandler[] {
    return this.sortedHandlers.filter(handler => handler.canHandle(mail));
  }

  /**
   * Update sorted handlers array
   */
  private updateSortedHandlers(): void {
    this.sortedHandlers = Array.from(this.handlers.values())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
}