/**
 * Base Service Class
 */
import { MailTransportAdapter } from '../transport/MailTransportAdapter.js';
import { MailHandlerRegistry } from '../handlers/MailHandlerRegistry.js';
import { ResponseDecoder } from '../handlers/ResponseDecoder.js';
import { UI_OPERATION_TIMEOUT_MS, DEFAULT_UI_AGENT_EMAIL } from '../transport/constants.js';
/**
 * Base class for services that communicate via mail
 */
export class ServiceBase {
    transport;
    uiAgentEmail;
    defaultTimeout;
    handlers;
    decoder;
    constructor(config) {
        this.transport = config.transport;
        this.uiAgentEmail = config.uiAgentEmail || DEFAULT_UI_AGENT_EMAIL;
        this.defaultTimeout = config.timeout || UI_OPERATION_TIMEOUT_MS;
        this.handlers = new MailHandlerRegistry();
        this.decoder = new ResponseDecoder();
    }
    /**
     * Ensure transport is connected
     */
    async ensureConnected() {
        if (!this.transport.isConnected()) {
            await this.transport.connect();
        }
    }
    /**
     * Ensure user is authenticated
     */
    async ensureAuthenticated() {
        await this.ensureConnected();
        // Use transport's ensureAuthenticated which waits for identity confirmation
        if (typeof this.transport.ensureAuthenticated === 'function') {
            await this.transport.ensureAuthenticated();
        }
        else {
            const userEmail = this.transport.getUserEmail();
            if (!userEmail) {
                throw new Error('Not authenticated. Please login first.');
            }
        }
    }
    /**
     * Ensure UI agent is available
     */
    async ensureUiAgent() {
        try {
            await this.ensureAuthenticated();
        }
        catch (error) {
            // Re-throw auth errors with helpful messages
            if (error instanceof Error && error.message.includes('Not authenticated')) {
                throw error;
            }
            throw new Error('Not authenticated. Please run "mind-swarm auth login" to authenticate.');
        }
        // Update UI agent email if transport has it
        const transportUiEmail = this.transport.getUiAgentEmail();
        if (transportUiEmail) {
            this.uiAgentEmail = transportUiEmail;
        }
        else {
            throw new Error('Not authenticated. Please run "mind-swarm auth login" to authenticate.');
        }
    }
    /**
     * Send mail and wait for response
     */
    async sendAndWait(to, subject, body, options) {
        const timeout = options?.timeout || this.defaultTimeout;
        const messageId = this.generateMessageId();
        // Create response promise
        const responsePromise = new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                cleanup();
                reject(new Error(`Request timeout: ${subject}`));
            }, timeout);
            const cleanup = () => {
                clearTimeout(timer);
                this.transport.offMail(mailHandler);
            };
            const mailHandler = (mail) => {
                // Check if this is the response we're waiting for
                if (this.isResponse(mail, messageId, options?.expectSubject || subject)) {
                    cleanup();
                    resolve(mail);
                }
            };
            this.transport.onMail(mailHandler);
        });
        // Send the mail
        const mailOptions = {
            timeout,
            headers: {
                ...options?.headers,
                'Message-ID': messageId
            }
        };
        if (options?.inReplyTo) {
            mailOptions.inReplyTo = options.inReplyTo;
        }
        await this.transport.sendMailTo(to, subject, body, mailOptions);
        // Wait for response
        return responsePromise;
    }
    /**
     * Send mail to UI agent and wait for response
     */
    async sendToUiAgent(subject, body, options) {
        await this.ensureUiAgent();
        return this.sendAndWait(this.uiAgentEmail, subject, body, options);
    }
    /**
     * Check if mail is a response to our request
     */
    isResponse(mail, messageId, expectedSubject) {
        // Check if it's in reply to our message
        if (mail.in_reply_to === messageId) {
            return true;
        }
        // Check if subject matches expected pattern
        if (typeof expectedSubject === 'string') {
            // For string, check if response subject contains original
            const responsePattern = `Response: ${expectedSubject}`;
            const rePattern = `Re: ${expectedSubject}`;
            return mail.subject === responsePattern ||
                mail.subject === rePattern ||
                mail.subject.includes(expectedSubject);
        }
        else {
            // For regex, test directly
            return expectedSubject.test(mail.subject);
        }
    }
    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@mindswarm.ai>`;
    }
    /**
     * Parse response using decoder
     */
    parseResponse(mail) {
        return this.decoder.decode(mail);
    }
    /**
     * Check if response indicates success
     */
    isSuccessResponse(mail) {
        return ResponseDecoder.extractSuccess(mail);
    }
    /**
     * Extract error from response
     */
    extractError(mail) {
        return ResponseDecoder.extractError(mail);
    }
    // High-level command methods
    /**
     * List all projects
     */
    async listProjects() {
        const { listProjectsRequest } = await import('../transport/mailTemplates.js');
        const response = await this.sendToUiAgent('List Projects', listProjectsRequest(), { expectSubject: 'Project List Response' });
        const data = this.parseResponse(response);
        return data?.projects || [];
    }
    /**
     * Initiate project creation conversation
     */
    async initiateProjectCreation() {
        await this.ensureUiAgent();
        const { initiateProjectCreation } = await import('../transport/mailTemplates.js');
        // Just send the request, don't wait for response
        // The project_creator agent will start sending messages directly
        await this.transport.sendMailTo(this.uiAgentEmail, 'Create Project', initiateProjectCreation());
    }
    /**
     * Create a project creator agent with specific details
     * This allows direct project creation without interactive conversation
     */
    async createProjectCreatorAgent(projectDetails) {
        await this.ensureUiAgent();
        const { createProjectCreatorAgentRequest } = await import('../transport/mailTemplates.js');
        const response = await this.sendToUiAgent('Create Project Creator Agent', createProjectCreatorAgentRequest(projectDetails), { expectSubject: 'Agent Created Response' });
        const data = this.parseResponse(response);
        if (!data?.agent_id) {
            throw new Error('Failed to create project creator agent: agent_id is missing in the response');
        }
        return { agent_id: data.agent_id };
    }
    /**
     * Delete a project
     */
    async deleteProject(projectId, projectName) {
        const { deleteProjectRequest } = await import('../transport/mailTemplates.js');
        const template = deleteProjectRequest(projectId, projectName);
        const response = await this.sendToUiAgent(template.subject, template.body, { expectSubject: 'Project Deleted Response' });
        return this.isSuccessResponse(response);
    }
    /**
     * Detach a project (removes .mind-swarm folder only)
     */
    async detachProject(projectId, projectName) {
        const { detachProjectRequest } = await import('../transport/mailTemplates.js');
        const template = detachProjectRequest(projectId, projectName);
        const response = await this.sendToUiAgent(template.subject, template.body, { expectSubject: 'Project Detached Response' });
        return this.isSuccessResponse(response);
    }
    /**
     * Get project details
     */
    async getProject(projectId) {
        const response = await this.sendToUiAgent(`Get Project: ${projectId}`, `Please provide details for project ${projectId}`, { expectSubject: 'Project Details Response' });
        const data = this.parseResponse(response);
        return data?.project || null;
    }
    /**
     * List agents (optionally filtered by project)
     */
    async listAgents(projectId) {
        const { listAgentsRequest } = await import('../transport/mailTemplates.js');
        const response = await this.sendToUiAgent(projectId ? `List Agents for Project: ${projectId}` : 'List All Agents', listAgentsRequest(projectId ? { projectId } : undefined), { expectSubject: 'Agent List Response' });
        const data = this.parseResponse(response);
        return data?.agents || [];
    }
    /**
     * List tasks (optionally filtered by project)
     */
    async listTasks(projectId) {
        const { listTasksRequest, listAllTasksRequest } = await import('../transport/mailTemplates.js');
        const response = await this.sendToUiAgent(projectId ? `List Tasks for Project: ${projectId}` : 'List All Tasks', projectId ? listTasksRequest(projectId) : listAllTasksRequest(), { expectSubject: 'Task List Response' });
        const data = this.parseResponse(response);
        return data?.tasks || [];
    }
    /**
     * Get agent details
     */
    async getAgent(agentId) {
        const response = await this.sendToUiAgent(`Get Agent: ${agentId}`, `Please provide details for agent ${agentId}`, { expectSubject: 'Agent Details Response' });
        const data = this.parseResponse(response);
        return data?.agent || null;
    }
    /**
     * Get task details
     */
    async getTask(taskId) {
        const response = await this.sendToUiAgent(`Get Task: ${taskId}`, `Please provide details for task ${taskId}`, { expectSubject: 'Task Details Response' });
        const data = this.parseResponse(response);
        return data?.task || null;
    }
    /**
     * Get UI agent email
     */
    getUiAgentEmail() {
        return this.uiAgentEmail;
    }
    /**
     * Set UI agent email
     */
    setUiAgentEmail(email) {
        this.uiAgentEmail = email;
        this.transport.setUiAgentEmail(email);
    }
}
//# sourceMappingURL=ServiceBase.js.map