/**
 * Utility to extract and parse JSON from various response formats
 */
/**
 * Extract and parse JSON from a response that might be:
 * - A plain JSON object
 * - A JSON string
 * - A markdown code block containing JSON
 *
 * @param response - The response to parse
 * @returns The parsed JSON object or null if parsing fails
 */
export declare function parseMarkdownJson<T = any>(response: any): T | null;
/**
 * Extract a specific field from a JSON response
 *
 * @param response - The response to parse
 * @param field - The field to extract
 * @returns The field value or empty array if not found
 */
export declare function extractJsonField<T = any>(response: any, field: string): T[];
/**
 * Check if a string contains valid JSON
 */
export declare function isValidJson(str: string): boolean;
/**
 * Extract JSON from multiple possible formats
 */
export declare function extractAnyJson<T = any>(response: any): T | null;
//# sourceMappingURL=parseMarkdownJson.d.ts.map