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
export function parseMarkdownJson(response) {
    if (!response)
        return null;
    // If it's already an object, return it
    if (typeof response === 'object') {
        return response;
    }
    // If it's a string, try to parse it
    if (typeof response === 'string') {
        // First try to extract from markdown code block
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1]);
            }
            catch (e) {
                console.error('Failed to parse JSON from markdown block:', e);
            }
        }
        // If no markdown block, try parsing as direct JSON
        try {
            return JSON.parse(response);
        }
        catch (e) {
            // Not JSON, return null
            console.debug('Response is not valid JSON:', response);
        }
    }
    return null;
}
/**
 * Extract a specific field from a JSON response
 *
 * @param response - The response to parse
 * @param field - The field to extract
 * @returns The field value or empty array if not found
 */
export function extractJsonField(response, field) {
    const parsed = parseMarkdownJson(response);
    if (parsed && typeof parsed === 'object' && field in parsed) {
        const result = parsed[field] || [];
        return result;
    }
    return [];
}
/**
 * Check if a string contains valid JSON
 */
export function isValidJson(str) {
    try {
        JSON.parse(str);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Extract JSON from multiple possible formats
 */
export function extractAnyJson(response) {
    // Try direct parsing first
    const direct = parseMarkdownJson(response);
    if (direct)
        return direct;
    // If string, try to find any JSON-like content
    if (typeof response === 'string') {
        // Look for any JSON object patterns
        const patterns = [
            /\{[\s\S]*\}/g, // Any object
            /\[[\s\S]*\]/g // Any array
        ];
        for (const pattern of patterns) {
            const matches = response.match(pattern);
            if (matches) {
                for (const match of matches) {
                    try {
                        return JSON.parse(match);
                    }
                    catch {
                        // Continue to next match
                    }
                }
            }
        }
    }
    return null;
}
//# sourceMappingURL=parseMarkdownJson.js.map