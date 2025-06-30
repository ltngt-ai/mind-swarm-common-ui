/**
 * Browser-compatible EventEmitter implementation
 */
export declare class EventEmitter {
    private events;
    /**
     * Add event listener
     */
    on(event: string, listener: Function): this;
    /**
     * Add one-time event listener
     */
    once(event: string, listener: Function): this;
    /**
     * Remove event listener
     */
    off(event: string, listener: Function): this;
    /**
     * Emit event
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: string): this;
    /**
     * Get listeners for an event
     */
    listeners(event: string): Function[];
    /**
     * Get number of listeners for an event
     */
    listenerCount(event: string): number;
}
//# sourceMappingURL=EventEmitter.d.ts.map