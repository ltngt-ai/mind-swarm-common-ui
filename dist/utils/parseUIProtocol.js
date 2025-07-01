/**
 * Parse MindSwarm UI Protocol from markdown messages
 *
 * Detects and extracts UI elements from ```mind-swarm:ui code blocks
 */
/**
 * Parse a message for UI protocol blocks
 * Handles both raw messages and escaped messages (with \n and \")
 */
export function parseUIProtocol(message) {
    const segments = [];
    // First, unescape the message if it contains escaped characters
    let processedMessage = message;
    if (message.includes('\\n') || message.includes('\\"')) {
        try {
            // Try to parse as JSON string to unescape
            processedMessage = JSON.parse('"' + message + '"');
        }
        catch {
            // If that fails, manually replace common escapes
            processedMessage = message
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');
        }
    }
    // Regular expression to match ```mind-swarm:ui blocks
    const protocolRegex = /```mind-swarm:ui\s*\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    while ((match = protocolRegex.exec(processedMessage)) !== null) {
        // Add text before the protocol block
        if (match.index > lastIndex) {
            const textContent = processedMessage.substring(lastIndex, match.index);
            if (textContent.trim()) {
                segments.push({ type: 'text', content: textContent });
            }
        }
        // Parse the UI element JSON
        let jsonContent = match[1].trim();
        // Fix common JSON issues:
        // 1. Remove trailing commas before ] or }
        jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
        // 2. Fix escaped single quotes (should not be escaped in JSON)
        jsonContent = jsonContent.replace(/\\'/g, "'");
        try {
            const element = JSON.parse(jsonContent);
            // Validate that it's a valid UI element
            if (element.type && element.id) {
                segments.push({ type: 'ui_element', element: element });
            }
            else {
                // Invalid UI element, treat as text
                segments.push({ type: 'text', content: match[0] });
            }
        }
        catch (e) {
            // JSON parse error, treat as text
            console.warn('Failed to parse UI protocol JSON:', e);
            segments.push({ type: 'text', content: match[0] });
        }
        lastIndex = match.index + match[0].length;
    }
    // Add any remaining text
    if (lastIndex < processedMessage.length) {
        const remaining = processedMessage.substring(lastIndex);
        if (remaining.trim()) {
            segments.push({ type: 'text', content: remaining });
        }
    }
    // If no segments were created, return the entire message as text
    if (segments.length === 0 && processedMessage.trim()) {
        segments.push({ type: 'text', content: processedMessage });
    }
    return { segments };
}
/**
 * Extract UI elements from a message
 * Convenience function that returns just the UI elements
 */
export function extractUIElements(message) {
    const parsed = parseUIProtocol(message);
    return parsed.segments
        .filter(segment => segment.type === 'ui_element')
        .map(segment => segment.element);
}
/**
 * Format a message with UI elements removed
 * Returns just the text portions
 */
export function extractTextOnly(message) {
    const parsed = parseUIProtocol(message);
    return parsed.segments
        .filter(segment => segment.type === 'text')
        .map(segment => segment.content)
        .join('')
        .trim();
}
//# sourceMappingURL=parseUIProtocol.js.map