/**
 * UI-specific types that can be shared between implementations
 */
export interface ChatMessage {
    id: string;
    type: 'user' | 'agent' | 'system';
    content: string;
    timestamp: Date;
    agent?: string;
    status?: 'sending' | 'sent' | 'delivered' | 'error';
}
export interface UIElement {
    id: string;
    type: 'button' | 'input' | 'select' | 'checkbox' | 'button_group' | 'form';
    label?: string;
    placeholder?: string;
    options?: Array<{
        value: string;
        label: string;
    }>;
    buttons?: UIButton[];
    fields?: UIField[];
    value?: any;
    required?: boolean;
    disabled?: boolean;
}
export interface UIButton {
    id: string;
    label: string;
    type?: 'primary' | 'secondary' | 'danger';
    action?: {
        type: 'conversation_input' | 'form_submit' | 'navigation';
        value?: string;
        target?: string;
    };
    disabled?: boolean;
}
export interface UIField {
    id: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: Array<{
        value: string;
        label: string;
    }>;
    value?: any;
}
//# sourceMappingURL=ui.d.ts.map