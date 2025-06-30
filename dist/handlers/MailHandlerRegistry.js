/**
 * Mail Handler Registry
 */
/**
 * Registry for managing mail handlers
 */
export class MailHandlerRegistry {
    handlers = new Map();
    sortedHandlers = [];
    /**
     * Register a mail handler
     */
    register(handler) {
        if (this.handlers.has(handler.id)) {
            throw new Error(`Handler with id '${handler.id}' already registered`);
        }
        this.handlers.set(handler.id, handler);
        this.updateSortedHandlers();
    }
    /**
     * Unregister a mail handler
     */
    unregister(handlerId) {
        const deleted = this.handlers.delete(handlerId);
        if (deleted) {
            this.updateSortedHandlers();
        }
        return deleted;
    }
    /**
     * Get handler by ID
     */
    getHandler(handlerId) {
        return this.handlers.get(handlerId);
    }
    /**
     * Get all registered handlers
     */
    getAllHandlers() {
        return [...this.sortedHandlers];
    }
    /**
     * Clear all handlers
     */
    clear() {
        this.handlers.clear();
        this.sortedHandlers = [];
    }
    /**
     * Process mail through all applicable handlers
     */
    async process(mail) {
        const results = [];
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
            }
            catch (error) {
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
    async processOne(mail) {
        for (const handler of this.sortedHandlers) {
            try {
                if (handler.canHandle(mail)) {
                    const result = await handler.handle(mail);
                    if (result.handled && !result.error) {
                        return result;
                    }
                }
            }
            catch (error) {
                // Continue to next handler
            }
        }
        return null;
    }
    /**
     * Find all handlers that can handle the given mail
     */
    findHandlers(mail) {
        return this.sortedHandlers.filter(handler => handler.canHandle(mail));
    }
    /**
     * Update sorted handlers array
     */
    updateSortedHandlers() {
        this.sortedHandlers = Array.from(this.handlers.values())
            .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }
}
//# sourceMappingURL=MailHandlerRegistry.js.map