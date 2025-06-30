/**
 * Mail protocol types for RFC2822-based communication
 */
export interface Mail {
    from_address: string;
    to_address: string;
    subject: string;
    body: string;
    headers?: Record<string, string>;
    timestamp?: string;
    message_id?: string;
    in_reply_to?: string;
}
export interface WebSocketMessage {
    type: 'mail' | 'status' | 'error' | 'auth' | 'ping' | 'pong' | 'identity_confirmed' | 'mail_notification';
    data?: any;
    correlation_id?: string;
    timestamp?: string;
    email_address?: string;
    ui_agent_email?: string;
    message_id?: string;
    from?: string;
    to?: string;
    subject?: string;
    body?: any;
    in_reply_to?: string;
}
export interface MailMessage {
    headers: Record<string, string>;
    body: string;
}
export interface MailResponse {
    id: string;
    headers: Record<string, string>;
    body: string;
    from?: string;
    to?: string;
    subject?: string;
    timestamp?: string;
    in_reply_to?: string;
}
export interface MailQueueItem {
    id: string;
    mail: Mail;
    resolve: (response: MailResponse) => void;
    reject: (error: Error) => void;
    timestamp: number;
    timeout?: number;
}
//# sourceMappingURL=mail.d.ts.map