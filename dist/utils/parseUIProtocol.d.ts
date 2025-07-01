/**
 * Parse MindSwarm UI Protocol from markdown messages
 *
 * Detects and extracts UI elements from ```mind-swarm:ui code blocks
 */
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
export type MessageSegment = {
    type: 'text';
    content: string;
} | {
    type: 'ui_element';
    element: UIProtocolElement;
};
/**
 * Parse a message for UI protocol blocks
 * Handles both raw messages and escaped messages (with \n and \")
 */
export declare function parseUIProtocol(message: string): ParsedMessage;
/**
 * Extract UI elements from a message
 * Convenience function that returns just the UI elements
 */
export declare function extractUIElements(message: string): UIProtocolElement[];
/**
 * Format a message with UI elements removed
 * Returns just the text portions
 */
export declare function extractTextOnly(message: string): string;
//# sourceMappingURL=parseUIProtocol.d.ts.map