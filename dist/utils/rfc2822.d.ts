/**
 * RFC2822 utilities for mail protocol
 */
/**
 * Generate a unique message ID following RFC2822 format
 */
export declare function generateMessageId(): string;
/**
 * Generate a correlation ID for request/response tracking
 */
export declare function generateCorrelationId(): string;
/**
 * Format headers for RFC2822 compliance
 */
export declare function formatHeaders(headers: Record<string, string>): string;
/**
 * Parse headers from RFC2822 format
 */
export declare function parseHeaders(headerString: string): Record<string, string>;
//# sourceMappingURL=rfc2822.d.ts.map