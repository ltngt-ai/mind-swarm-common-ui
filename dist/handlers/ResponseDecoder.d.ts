/**
 * Response Decoder Utilities
 */
import type { Mail } from '../types/mail.js';
/**
 * Response decoder options
 */
export interface ResponseDecoderOptions {
    /**
     * Whether to try parsing JSON automatically
     */
    parseJson?: boolean;
    /**
     * Whether to extract JSON from mixed text
     */
    extractJson?: boolean;
    /**
     * Whether to convert string 'true'/'false' to boolean
     */
    parseBooleans?: boolean;
    /**
     * Custom decoder function
     */
    customDecoder?: (body: any) => any;
}
/**
 * Response decoder for parsing mail responses
 */
export declare class ResponseDecoder {
    private options;
    constructor(options?: ResponseDecoderOptions);
    /**
     * Decode mail body
     */
    decode(mail: Mail): any;
    /**
     * Try to parse as JSON
     */
    private tryParseJson;
    /**
     * Extract JSON from mixed content
     */
    private extractJson;
    /**
     * Decode with specific type validation
     */
    decodeAs<T>(mail: Mail, validator: (data: any) => data is T): T | null;
    /**
     * Extract specific fields from response
     */
    extractFields(mail: Mail, fields: string[]): Record<string, any>;
    /**
     * Extract value by path (e.g., 'data.items[0].name')
     */
    extractPath(mail: Mail, path: string): any;
    /**
     * Get value by path from object
     */
    private getValueByPath;
    /**
     * Common response patterns
     */
    static extractSuccess(mail: Mail): boolean;
    /**
     * Extract error message
     */
    static extractError(mail: Mail): string | null;
}
//# sourceMappingURL=ResponseDecoder.d.ts.map