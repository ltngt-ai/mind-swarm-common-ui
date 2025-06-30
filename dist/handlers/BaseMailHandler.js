/**
 * Base Mail Handler Implementation
 */
/**
 * Abstract base class for mail handlers
 */
export class BaseMailHandler {
    id;
    priority;
    matcher;
    constructor(config) {
        this.id = config.id;
        this.priority = config.priority || 0;
        this.matcher = config.matcher;
    }
    /**
     * Check if handler can process mail using matcher
     */
    canHandle(mail) {
        if (!this.matcher) {
            return this.customCanHandle(mail);
        }
        // Check subject
        if (this.matcher.subject) {
            if (!this.matchField(mail.subject, this.matcher.subject)) {
                return false;
            }
        }
        // Check from
        if (this.matcher.from) {
            if (!this.matchField(mail.from_address, this.matcher.from)) {
                return false;
            }
        }
        // Check to
        if (this.matcher.to) {
            if (!this.matchField(mail.to_address, this.matcher.to)) {
                return false;
            }
        }
        // Check body
        if (this.matcher.body) {
            if (!this.matchField(mail.body || '', this.matcher.body)) {
                return false;
            }
        }
        // Check headers
        if (this.matcher.headers && mail.headers) {
            for (const [key, pattern] of Object.entries(this.matcher.headers)) {
                const value = mail.headers[key];
                if (!value || !this.matchField(value, pattern)) {
                    return false;
                }
            }
        }
        // All checks passed, additionally check custom logic
        return this.customCanHandle(mail);
    }
    /**
     * Override for custom matching logic
     */
    customCanHandle(_mail) {
        return true;
    }
    /**
     * Match field against pattern
     */
    matchField(field, pattern) {
        if (typeof pattern === 'string') {
            return field.includes(pattern);
        }
        else {
            return pattern.test(field);
        }
    }
    /**
     * Helper method to create successful result
     */
    success(data) {
        return { handled: true, data };
    }
    /**
     * Helper method to create error result
     */
    error(error) {
        return { handled: true, error };
    }
    /**
     * Helper method to indicate not handled
     */
    notHandled() {
        return { handled: false };
    }
}
//# sourceMappingURL=BaseMailHandler.js.map