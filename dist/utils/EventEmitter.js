/**
 * Browser-compatible EventEmitter implementation
 */
export class EventEmitter {
    events = new Map();
    /**
     * Add event listener
     */
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
        return this;
    }
    /**
     * Add one-time event listener
     */
    once(event, listener) {
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            listener.apply(this, args);
        };
        return this.on(event, onceWrapper);
    }
    /**
     * Remove event listener
     */
    off(event, listener) {
        const listeners = this.events.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
            if (listeners.length === 0) {
                this.events.delete(event);
            }
        }
        return this;
    }
    /**
     * Emit event
     */
    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (listeners && listeners.length > 0) {
            listeners.forEach(listener => {
                try {
                    listener.apply(this, args);
                }
                catch (error) {
                    console.error(`Error in event listener for '${event}':`, error);
                }
            });
            return true;
        }
        return false;
    }
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        }
        else {
            this.events.clear();
        }
        return this;
    }
    /**
     * Get listeners for an event
     */
    listeners(event) {
        return [...(this.events.get(event) || [])];
    }
    /**
     * Get number of listeners for an event
     */
    listenerCount(event) {
        return this.events.get(event)?.length || 0;
    }
}
//# sourceMappingURL=EventEmitter.js.map