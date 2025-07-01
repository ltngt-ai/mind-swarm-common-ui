/**
 * Base Service Class
 */
import { MailTransportAdapter } from '../transport/MailTransportAdapter.js';
import type { Mail } from '../types/mail.js';
import { MailHandlerRegistry } from '../handlers/MailHandlerRegistry.js';
import { ResponseDecoder } from '../handlers/ResponseDecoder.js';
/**
 * Service configuration
 */
export interface ServiceConfig {
    transport: MailTransportAdapter;
    uiAgentEmail?: string;
    timeout?: number;
}
/**
 * Base class for services that communicate via mail
 */
export declare abstract class ServiceBase {
    protected transport: MailTransportAdapter;
    protected uiAgentEmail: string;
    protected defaultTimeout: number;
    protected handlers: MailHandlerRegistry;
    protected decoder: ResponseDecoder;
    constructor(config: ServiceConfig);
    /**
     * Ensure transport is connected
     */
    protected ensureConnected(): Promise<void>;
    /**
     * Ensure user is authenticated
     */
    protected ensureAuthenticated(): Promise<void>;
    /**
     * Ensure UI agent is available
     */
    protected ensureUiAgent(): Promise<void>;
    /**
     * Send mail and wait for response
     */
    protected sendAndWait(to: string, subject: string, body: string, options?: {
        timeout?: number;
        inReplyTo?: string;
        headers?: Record<string, string>;
        expectSubject?: string | RegExp;
    }): Promise<Mail>;
    /**
     * Send mail to UI agent and wait for response
     */
    protected sendToUiAgent(subject: string, body: string, options?: {
        timeout?: number;
        headers?: Record<string, string>;
        expectSubject?: string | RegExp;
    }): Promise<Mail>;
    /**
     * Check if mail is a response to our request
     */
    protected isResponse(mail: Mail, messageId: string, expectedSubject: string | RegExp): boolean;
    /**
     * Generate unique message ID
     */
    protected generateMessageId(): string;
    /**
     * Parse response using decoder
     */
    protected parseResponse<T = any>(mail: Mail): T;
    /**
     * Check if response indicates success
     */
    protected isSuccessResponse(mail: Mail): boolean;
    /**
     * Extract error from response
     */
    protected extractError(mail: Mail): string | null;
    /**
     * List all projects
     */
    listProjects(): Promise<any[]>;
    /**
     * Initiate project creation conversation
     */
    initiateProjectCreation(): Promise<void>;
    /**
     * Delete a project
     */
    deleteProject(projectId: string, projectName: string): Promise<boolean>;
    /**
     * Detach a project (removes .mind-swarm folder only)
     */
    detachProject(projectId: string, projectName: string): Promise<boolean>;
    /**
     * Get project details
     */
    getProject(projectId: string): Promise<any>;
    /**
     * List agents (optionally filtered by project)
     */
    listAgents(projectId?: string): Promise<any[]>;
    /**
     * List tasks (optionally filtered by project)
     */
    listTasks(projectId?: string): Promise<any[]>;
    /**
     * Get agent details
     */
    getAgent(agentId: string): Promise<any>;
    /**
     * Get task details
     */
    getTask(taskId: string): Promise<any>;
    /**
     * Get UI agent email
     */
    getUiAgentEmail(): string;
    /**
     * Set UI agent email
     */
    setUiAgentEmail(email: string): void;
}
//# sourceMappingURL=ServiceBase.d.ts.map