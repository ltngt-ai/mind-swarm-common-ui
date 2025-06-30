/**
 * MailQueue - Handles message queueing and deduplication
 *
 * This class ensures:
 * 1. No duplicate messages are sent within a time window
 * 2. Messages are queued if connection is down
 * 3. Clear debugging information is available
 */
import { v4 as uuidv4 } from 'uuid';
import { MESSAGE_DEDUP_WINDOW_MS } from './constants.js';
export class MailQueue {
    queue = [];
    recentHashes = new Map();
    dedupeWindowMs;
    maxAttempts;
    debugLog = [];
    maxDebugLog;
    enableConsoleLogging;
    cleanupInterval;
    constructor(config = {}) {
        this.dedupeWindowMs = config.dedupeWindowMs ?? MESSAGE_DEDUP_WINDOW_MS;
        this.maxAttempts = config.maxAttempts ?? 3;
        this.maxDebugLog = config.maxDebugLog ?? 100;
        this.enableConsoleLogging = config.enableConsoleLogging ?? true;
        // Clean up old hashes periodically
        this.cleanupInterval = setInterval(() => this.cleanupHashes(), 5000);
    }
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
        this.clear();
    }
    /**
     * Add a message to the queue
     * Returns null if message is duplicate, otherwise returns queue ID
     */
    enqueue(to, subject, body, headers) {
        const id = uuidv4();
        return this.enqueueWithId(id, to, subject, body, headers) ? id : null;
    }
    /**
     * Add a message to the queue with a specific ID
     * Returns false if message is duplicate
     */
    enqueueWithId(id, to, subject, body, headers) {
        const hash = this.generateHash(to, subject, body);
        const now = Date.now();
        // Check for recent duplicate
        const lastSeen = this.recentHashes.get(hash);
        if (lastSeen && (now - lastSeen) < this.dedupeWindowMs) {
            this.addDebugLog(`Duplicate message rejected: ${subject} to ${to}`);
            return false;
        }
        // Add to queue
        const mail = {
            id,
            to,
            subject,
            body,
            timestamp: now,
            attempts: 0,
            hash,
            headers: headers || undefined
        };
        this.queue.push(mail);
        this.recentHashes.set(hash, now);
        this.addDebugLog(`Message queued: ${subject} to ${to} (${id})`);
        return true;
    }
    /**
     * Get next message from queue
     */
    dequeue() {
        const mail = this.queue.shift();
        if (mail) {
            mail.attempts++;
            this.addDebugLog(`Message dequeued: ${mail.subject} to ${mail.to} (attempt ${mail.attempts})`);
        }
        return mail || null;
    }
    /**
     * Put message back in queue (for retry)
     */
    requeue(mail) {
        if (mail.attempts < this.maxAttempts) {
            this.queue.unshift(mail);
            this.addDebugLog(`Message requeued: ${mail.subject} to ${mail.to} (attempt ${mail.attempts})`);
        }
        else {
            this.addDebugLog(`Message dropped after ${this.maxAttempts} attempts: ${mail.subject} to ${mail.to}`);
        }
    }
    /**
     * Remove a specific message from queue by ID
     */
    remove(id) {
        const index = this.queue.findIndex(mail => mail.id === id);
        if (index >= 0) {
            const mail = this.queue.splice(index, 1)[0];
            this.addDebugLog(`Message removed from queue: ${mail.subject} to ${mail.to} (${id})`);
            return true;
        }
        return false;
    }
    /**
     * Get current queue size
     */
    size() {
        return this.queue.length;
    }
    /**
     * Check if queue is empty
     */
    isEmpty() {
        return this.queue.length === 0;
    }
    /**
     * Get all queued messages (read-only)
     */
    getAll() {
        return [...this.queue];
    }
    /**
     * Clear the queue
     */
    clear() {
        this.queue = [];
        this.recentHashes.clear();
        this.addDebugLog('Queue cleared');
    }
    /**
     * Get debug log for AI debugging
     */
    getDebugLog() {
        return [...this.debugLog];
    }
    /**
     * Clear debug log
     */
    clearDebugLog() {
        this.debugLog = [];
    }
    /**
     * Generate hash for deduplication
     */
    generateHash(to, subject, body) {
        // Create a more robust hash that includes content but is still readable
        const content = `${to}|${subject}|${body.substring(0, 200)}`;
        // Simple but effective hash for deduplication
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
    /**
     * Clean up old hashes
     */
    cleanupHashes() {
        const now = Date.now();
        const expired = [];
        this.recentHashes.forEach((timestamp, hash) => {
            if (now - timestamp > this.dedupeWindowMs * 2) {
                expired.push(hash);
            }
        });
        expired.forEach(hash => this.recentHashes.delete(hash));
        if (expired.length > 0) {
            this.addDebugLog(`Cleaned up ${expired.length} expired hash(es)`);
        }
    }
    /**
     * Add to debug log
     */
    addDebugLog(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        this.debugLog.push(logMessage);
        // Keep log size manageable
        if (this.debugLog.length > this.maxDebugLog) {
            this.debugLog.shift();
        }
        // Also log to console for visibility (if enabled)
        if (this.enableConsoleLogging) {
            console.log(`📬 MailQueue: ${message}`);
        }
    }
}
//# sourceMappingURL=MailQueue.js.map