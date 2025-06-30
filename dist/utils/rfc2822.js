/**
 * RFC2822 utilities for mail protocol
 */
import { v4 as uuidv4 } from 'uuid';
/**
 * Generate a unique message ID following RFC2822 format
 */
export function generateMessageId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 11);
    return `<${timestamp}.${random}@mind-swarm.ui>`;
}
/**
 * Generate a correlation ID for request/response tracking
 */
export function generateCorrelationId() {
    return uuidv4();
}
/**
 * Format headers for RFC2822 compliance
 */
export function formatHeaders(headers) {
    return Object.entries(headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\r\n');
}
/**
 * Parse headers from RFC2822 format
 */
export function parseHeaders(headerString) {
    const headers = {};
    const lines = headerString.split('\r\n');
    for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            headers[key] = value;
        }
    }
    return headers;
}
//# sourceMappingURL=rfc2822.js.map