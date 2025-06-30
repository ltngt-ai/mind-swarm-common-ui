/**
 * Base Mail Handler Implementation
 */
import type { Mail } from '../types/mail.js';
import type { MailHandler, MailHandlerConfig, MailHandlerResult, MailMatcher } from './types.js';
/**
 * Abstract base class for mail handlers
 */
export declare abstract class BaseMailHandler implements MailHandler {
    readonly id: string;
    readonly priority: number;
    protected matcher: MailMatcher | undefined;
    constructor(config: MailHandlerConfig);
    /**
     * Check if handler can process mail using matcher
     */
    canHandle(mail: Mail): boolean;
    /**
     * Override for custom matching logic
     */
    protected customCanHandle(_mail: Mail): boolean;
    /**
     * Match field against pattern
     */
    protected matchField(field: string, pattern: string | RegExp): boolean;
    /**
     * Abstract handle method to be implemented by subclasses
     */
    abstract handle(mail: Mail): Promise<MailHandlerResult>;
    /**
     * Helper method to create successful result
     */
    protected success(data?: any): MailHandlerResult;
    /**
     * Helper method to create error result
     */
    protected error(error: Error): MailHandlerResult;
    /**
     * Helper method to indicate not handled
     */
    protected notHandled(): MailHandlerResult;
}
//# sourceMappingURL=BaseMailHandler.d.ts.map