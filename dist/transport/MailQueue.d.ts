/**
 * MailQueue - Handles message queueing and deduplication
 *
 * This class ensures:
 * 1. No duplicate messages are sent within a time window
 * 2. Messages are queued if connection is down
 * 3. Clear debugging information is available
 */
export interface QueuedMail {
    id: string;
    to: string;
    subject: string;
    body: string;
    timestamp: number;
    attempts: number;
    hash: string;
    headers?: Record<string, string> | undefined;
}
export interface MailQueueConfig {
    dedupeWindowMs?: number;
    maxAttempts?: number;
    maxDebugLog?: number;
    enableConsoleLogging?: boolean;
}
export declare class MailQueue {
    private queue;
    private recentHashes;
    private dedupeWindowMs;
    private maxAttempts;
    private debugLog;
    private maxDebugLog;
    private enableConsoleLogging;
    private cleanupInterval?;
    constructor(config?: MailQueueConfig);
    /**
     * Cleanup resources
     */
    destroy(): void;
    /**
     * Add a message to the queue
     * Returns null if message is duplicate, otherwise returns queue ID
     */
    enqueue(to: string, subject: string, body: string, headers?: Record<string, string>): string | null;
    /**
     * Add a message to the queue with a specific ID
     * Returns false if message is duplicate
     */
    enqueueWithId(id: string, to: string, subject: string, body: string, headers?: Record<string, string>): boolean;
    /**
     * Get next message from queue
     */
    dequeue(): QueuedMail | null;
    /**
     * Put message back in queue (for retry)
     */
    requeue(mail: QueuedMail): void;
    /**
     * Remove a specific message from queue by ID
     */
    remove(id: string): boolean;
    /**
     * Get current queue size
     */
    size(): number;
    /**
     * Check if queue is empty
     */
    isEmpty(): boolean;
    /**
     * Get all queued messages (read-only)
     */
    getAll(): readonly QueuedMail[];
    /**
     * Clear the queue
     */
    clear(): void;
    /**
     * Get debug log for AI debugging
     */
    getDebugLog(): readonly string[];
    /**
     * Clear debug log
     */
    clearDebugLog(): void;
    /**
     * Generate hash for deduplication
     */
    private generateHash;
    /**
     * Clean up old hashes
     */
    private cleanupHashes;
    /**
     * Add to debug log
     */
    private addDebugLog;
}
//# sourceMappingURL=MailQueue.d.ts.map