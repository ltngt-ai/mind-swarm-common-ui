/**
 * Mail Templates - Human-editable mail message templates
 *
 * This module contains all the mail templates used to communicate with agents.
 * Each template should be clear, specific, and include the word "reply".
 */
export interface MailTemplate {
    subject: string;
    body: string;
}
/**
 * Request project list
 */
export declare const listProjectsRequest: () => string;
/**
 * Request task list for a project
 */
export declare const listTasksRequest: (projectId: string) => string;
/**
 * Request all tasks across all projects
 */
export declare const listAllTasksRequest: () => string;
/**
 * Request agent list
 */
export declare const listAgentsRequest: (scope?: {
    projectId?: string;
}) => string;
/**
 * Request delete project
 */
export declare const deleteProjectRequest: (projectId: string, projectName: string) => MailTemplate;
/**
 * Request detach project
 */
export declare const detachProjectRequest: (projectId: string, projectName: string) => MailTemplate;
/**
 * Initiate project creation conversation
 */
export declare const initiateProjectCreation: () => string;
/**
 * Create project request
 */
export declare const createProjectRequest: (name: string, description?: string) => string;
/**
 * Chat subject templates
 */
export declare const chatSubject: {
    readonly default: "Chat";
    readonly projectCreation: "Project Creation Request";
    readonly statusUpdate: "Status Update Request";
};
/**
 * Generic chat message
 */
export declare const chatMessage: (message: string) => string;
/**
 * Request status update
 */
export declare const statusUpdateRequest: (entityType: string, entityId: string) => string;
//# sourceMappingURL=mailTemplates.d.ts.map