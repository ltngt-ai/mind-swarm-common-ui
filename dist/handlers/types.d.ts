/**
 * Mail Handler Types and Interfaces
 */
import type { Mail } from '../types/mail.js';
/**
 * Mail handler result
 */
export interface MailHandlerResult {
    handled: boolean;
    data?: any;
    error?: Error;
}
/**
 * Mail handler interface
 */
export interface MailHandler {
    /**
     * Unique identifier for this handler
     */
    id: string;
    /**
     * Priority for handler execution (higher = earlier)
     */
    priority?: number;
    /**
     * Check if this handler can process the given mail
     */
    canHandle(mail: Mail): boolean;
    /**
     * Handle the mail and return result
     */
    handle(mail: Mail): Promise<MailHandlerResult>;
}
/**
 * Mail matcher interface for flexible matching
 */
export interface MailMatcher {
    subject?: string | RegExp;
    from?: string | RegExp;
    to?: string | RegExp;
    body?: string | RegExp;
    headers?: Record<string, string | RegExp>;
}
/**
 * Base mail handler configuration
 */
export interface MailHandlerConfig {
    id: string;
    priority?: number;
    matcher?: MailMatcher;
}
/**
 * Response parser function type
 */
export type ResponseParser<T = any> = (mail: Mail) => T | Promise<T>;
/**
 * Error handler function type
 */
export type ErrorHandler = (error: Error, mail: Mail) => void | Promise<void>;
//# sourceMappingURL=types.d.ts.map