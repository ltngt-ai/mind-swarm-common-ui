/**
 * Mail Handler Registry
 */
import type { Mail } from '../types/mail.js';
import type { MailHandler, MailHandlerResult } from './types.js';
/**
 * Registry for managing mail handlers
 */
export declare class MailHandlerRegistry {
    private handlers;
    private sortedHandlers;
    /**
     * Register a mail handler
     */
    register(handler: MailHandler): void;
    /**
     * Unregister a mail handler
     */
    unregister(handlerId: string): boolean;
    /**
     * Get handler by ID
     */
    getHandler(handlerId: string): MailHandler | undefined;
    /**
     * Get all registered handlers
     */
    getAllHandlers(): MailHandler[];
    /**
     * Clear all handlers
     */
    clear(): void;
    /**
     * Process mail through all applicable handlers
     */
    process(mail: Mail): Promise<MailHandlerResult[]>;
    /**
     * Process mail and return first successful result
     */
    processOne(mail: Mail): Promise<MailHandlerResult | null>;
    /**
     * Find all handlers that can handle the given mail
     */
    findHandlers(mail: Mail): MailHandler[];
    /**
     * Update sorted handlers array
     */
    private updateSortedHandlers;
}
//# sourceMappingURL=MailHandlerRegistry.d.ts.map