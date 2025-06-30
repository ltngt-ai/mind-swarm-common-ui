/**
 * Browser-compatible EventEmitter implementation
 */

export class EventEmitter {
  private events: Map<string, Function[]> = new Map();

  /**
   * Add event listener
   */
  on(event: string, listener: Function): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
    return this;
  }

  /**
   * Add one-time event listener
   */
  once(event: string, listener: Function): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    return this.on(event, onceWrapper);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: Function): this {
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
  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (listeners && listeners.length > 0) {
      listeners.forEach(listener => {
        try {
          listener.apply(this, args);
        } catch (error) {
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
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * Get listeners for an event
   */
  listeners(event: string): Function[] {
    return [...(this.events.get(event) || [])];
  }

  /**
   * Get number of listeners for an event
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.length || 0;
  }
}