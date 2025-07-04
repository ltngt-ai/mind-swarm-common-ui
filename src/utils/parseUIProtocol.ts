/**
 * Parse Mind-Swarm UI Protocol from markdown messages
 * 
 * Detects and extracts UI elements from ```mind-swarm:ui code blocks
 */

// Define UIProtocolElement interface for protocol-specific elements
export interface UIProtocolElement {
  id: string;
  type: 'button' | 'button_group' | 'dropdown' | 'text_input' | 'checkbox' | 'radio_group';
  label?: string;
  description?: string;
  disabled?: boolean;
  visible?: boolean;
  value?: any;
  placeholder?: string;
  action?: string;
  action_template?: string;
  icon?: string;
  variant?: string;
  layout?: 'horizontal' | 'vertical';
  allow_multiple?: boolean;
  validation?: Array<{
    type: string;
    value?: any;
    message: string;
  }>;
  options?: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;
  buttons?: Array<{
    id: string;
    type?: string;
    label: string;
    description?: string;
    disabled?: boolean;
    visible?: boolean;
    action?: string;
    icon?: string;
  }>;
}

export interface ParsedMessage {
  segments: MessageSegment[];
}

export type MessageSegment = 
  | { type: 'text'; content: string }
  | { type: 'ui_element'; element: UIProtocolElement };

/**
 * Parse a message for UI protocol blocks
 * Handles both raw messages and escaped messages (with \n and \")
 */
export function parseUIProtocol(message: string): ParsedMessage {
  const segments: MessageSegment[] = [];
  
  // First, unescape the message if it contains escaped characters
  let processedMessage = message;
  if (message.includes('\\n') || message.includes('\\"')) {
    try {
      // Try to parse as JSON string to unescape
      processedMessage = JSON.parse('"' + message + '"');
    } catch {
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
    
    // 3. Fix stray backslashes before quotes (common in malformed JSON)
    // This handles cases like: "label": "text",\      "action": "..."
    jsonContent = jsonContent.replace(/,\s*\\\s*"/g, ', "');
    
    // 4. Fix any remaining stray backslashes that aren't part of escape sequences
    // Negative lookbehind to avoid breaking valid escapes like \n, \t, \", etc.
    jsonContent = jsonContent.replace(/\\(?!["\\/bfnrtu])/g, '');
    
    try {
      const element = JSON.parse(jsonContent);
      
      // Validate that it's a valid UI element
      if (element.type && element.id) {
        segments.push({ type: 'ui_element', element: element as UIProtocolElement });
      } else {
        // Invalid UI element, treat as text
        segments.push({ type: 'text', content: match[0] });
      }
    } catch (e) {
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
export function extractUIElements(message: string): UIProtocolElement[] {
  const parsed = parseUIProtocol(message);
  return parsed.segments
    .filter(segment => segment.type === 'ui_element')
    .map(segment => (segment as any).element);
}

/**
 * Format a message with UI elements removed
 * Returns just the text portions
 */
export function extractTextOnly(message: string): string {
  const parsed = parseUIProtocol(message);
  return parsed.segments
    .filter(segment => segment.type === 'text')
    .map(segment => (segment as any).content)
    .join('')
    .trim();
}