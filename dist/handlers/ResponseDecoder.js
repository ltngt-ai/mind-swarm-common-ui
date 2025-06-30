/**
 * Response Decoder Utilities
 */
/**
 * Response decoder for parsing mail responses
 */
export class ResponseDecoder {
    options;
    constructor(options = {}) {
        this.options = {
            parseJson: true,
            extractJson: true,
            parseBooleans: true,
            ...options
        };
    }
    /**
     * Decode mail body
     */
    decode(mail) {
        const body = mail.body;
        // No body to decode
        if (body === null || body === undefined || body === '') {
            return null;
        }
        // Apply custom decoder if provided
        if (this.options.customDecoder) {
            return this.options.customDecoder(body);
        }
        // If already an object, return as-is
        if (typeof body === 'object') {
            return body;
        }
        // Convert to string for processing
        const bodyStr = String(body);
        // Try JSON parsing
        if (this.options.parseJson) {
            const jsonResult = this.tryParseJson(bodyStr);
            if (jsonResult !== null) {
                return jsonResult;
            }
        }
        // Try extracting JSON from mixed content
        if (this.options.extractJson) {
            const extracted = this.extractJson(bodyStr);
            if (extracted !== null) {
                return extracted;
            }
        }
        // Parse boolean strings
        if (this.options.parseBooleans) {
            const lower = bodyStr.toLowerCase().trim();
            if (lower === 'true')
                return true;
            if (lower === 'false')
                return false;
        }
        // Return as string
        return bodyStr;
    }
    /**
     * Try to parse as JSON
     */
    tryParseJson(str) {
        try {
            return JSON.parse(str);
        }
        catch {
            return null;
        }
    }
    /**
     * Extract JSON from mixed content
     */
    extractJson(str) {
        // Look for JSON object
        const objectMatch = str.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            const jsonResult = this.tryParseJson(objectMatch[0]);
            if (jsonResult !== null) {
                return jsonResult;
            }
        }
        // Look for JSON array
        const arrayMatch = str.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            const jsonResult = this.tryParseJson(arrayMatch[0]);
            if (jsonResult !== null) {
                return jsonResult;
            }
        }
        return null;
    }
    /**
     * Decode with specific type validation
     */
    decodeAs(mail, validator) {
        const decoded = this.decode(mail);
        return validator(decoded) ? decoded : null;
    }
    /**
     * Extract specific fields from response
     */
    extractFields(mail, fields) {
        const decoded = this.decode(mail);
        const result = {};
        if (typeof decoded === 'object' && decoded !== null) {
            for (const field of fields) {
                if (field in decoded) {
                    result[field] = decoded[field];
                }
            }
        }
        return result;
    }
    /**
     * Extract value by path (e.g., 'data.items[0].name')
     */
    extractPath(mail, path) {
        const decoded = this.decode(mail);
        return this.getValueByPath(decoded, path);
    }
    /**
     * Get value by path from object
     */
    getValueByPath(obj, path) {
        const keys = path.split(/[.\[\]]/).filter(Boolean);
        let current = obj;
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        return current;
    }
    /**
     * Common response patterns
     */
    static extractSuccess(mail) {
        const decoder = new ResponseDecoder();
        const decoded = decoder.decode(mail);
        if (typeof decoded === 'object' && decoded !== null) {
            // Check common success fields
            if ('success' in decoded)
                return Boolean(decoded.success);
            if ('ok' in decoded)
                return Boolean(decoded.ok);
            if ('error' in decoded)
                return !decoded.error;
            if ('status' in decoded) {
                return decoded.status === 'success' ||
                    decoded.status === 'ok' ||
                    decoded.status === 200;
            }
        }
        // Check body text for success indicators
        const bodyText = String(mail.body).toLowerCase();
        return bodyText.includes('success') ||
            bodyText.includes('completed') ||
            bodyText.includes('created') ||
            bodyText.includes('updated') ||
            bodyText.includes('deleted');
    }
    /**
     * Extract error message
     */
    static extractError(mail) {
        const decoder = new ResponseDecoder();
        const decoded = decoder.decode(mail);
        if (typeof decoded === 'object' && decoded !== null) {
            // Check common error fields
            if ('error' in decoded)
                return String(decoded.error);
            if ('message' in decoded && decoded.success === false)
                return String(decoded.message);
            if ('error_message' in decoded)
                return String(decoded.error_message);
        }
        // Check body for error patterns
        const bodyText = String(mail.body);
        const errorMatch = bodyText.match(/error:\s*(.+)/i);
        if (errorMatch) {
            return errorMatch[1].trim();
        }
        return null;
    }
}
//# sourceMappingURL=ResponseDecoder.js.map