/**
 * Transport exports
 */

// Base types and interfaces
export * from './types.js';

// Base transport implementation
export { BaseTransport } from './BaseTransport.js';

// WebSocket transport
export { WebSocketTransport } from './WebSocketTransport.js';
export type { WebSocketTransportConfig } from './WebSocketTransport.js';

// Mail transport adapter
export { MailTransportAdapter } from './MailTransportAdapter.js';
export type { MailTransportConfig } from './MailTransportAdapter.js';

// Legacy exports for backward compatibility
export { MailQueue } from './MailQueue.js';
export type { QueuedMail, MailQueueConfig } from './MailQueue.js';
export * from './mailTemplates.js';
export * from './constants.js';