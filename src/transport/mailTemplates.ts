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
export const listProjectsRequest = (): string => `Please reply with subject "Project List Response" and a list of all projects in the following JSON format:
{
  "projects": [
    {
      "id": "project-uuid",
      "name": "Project Name",
      "status": "active",
      "description": "Optional description",
      "agents_count": 0,
      "tasks_count": 0
    }
  ]
}`;

/**
 * Request task list for a project
 */
export const listTasksRequest = (projectId: string): string => `Please reply with a list of all tasks in project ${projectId} in the following JSON format:
{
  "tasks": [
    {
      "id": "task-uuid",
      "project_id": "${projectId}",
      "name": "Task Name",
      "type": "recurring" | "oneshot",
      "status": "running" | "pending" | "completed",
      "progress": 0,
      "description": "Optional description"
    }
  ]
}`;

/**
 * Request all tasks across all projects
 */
export const listAllTasksRequest = (): string => `Please reply with a list of all tasks across all projects in the following JSON format:
{
  "tasks": [
    {
      "id": "task-uuid",
      "project_id": "project-uuid",
      "name": "Task Name",
      "type": "recurring" | "oneshot",
      "status": "running" | "pending" | "completed",
      "progress": 0,
      "description": "Optional description"
    }
  ]
}`;

/**
 * Request agent list
 */
export const listAgentsRequest = (scope?: { projectId?: string }): string => {
  let scopeText = '';
  if (scope?.projectId) {
    scopeText = ` for project ${scope.projectId}`;
  }
  
  return `Please reply with a list of all agents${scopeText} in the following JSON format:
{
  "agents": [
    {
      "id": "agent-uuid",
      "name": "Agent Name",
      "type": "agent_type",
      "status": "online" | "offline" | "idle",
      "mailbox": "agent@domain",
      "description": "Optional description",
      "project_id": "project-uuid"
    }
  ]
}`;
};

/**
 * Request delete project
 */
export const deleteProjectRequest = (projectId: string, projectName: string): MailTemplate => ({
  subject: `Request: Delete Project ${projectName}`,
  body: `Please delete the entire project folder for project ID: ${projectId} ("${projectName}") and reply with subject "Project Deleted Response" in the following JSON format:
{
  "success": true,
  "message": "Project deleted successfully"
}

Or if there's an error:
{
  "success": false,
  "error": "Error message here"
}

Project ID: ${projectId}
Project Name: ${projectName}`
});

/**
 * Request detach project
 */
export const detachProjectRequest = (projectId: string, projectName: string): MailTemplate => ({
  subject: `Request: Detach Project ${projectName}`,
  body: `Please detach project ID: ${projectId} ("${projectName}") from this UI. Only remove the .mind-swarm folder and reply with subject "Project Detached Response" in the following JSON format:
{
  "success": true,
  "message": "Project detached successfully"
}

Or if there's an error:
{
  "success": false,
  "error": "Error message here"
}

Project ID: ${projectId}
Project Name: ${projectName}`
});

/**
 * Initiate project creation conversation
 */
export const initiateProjectCreation = (): string => 
  `I want to work on a new project.

Please use the subject "Conversation" for all messages during our project creation dialog.
When the project is successfully created, use the subject "Project Creation Complete".`;

/**
 * Create project request
 */
export const createProjectRequest = (name: string, description?: string): string => 
  `I want to work on a project called "${name}".${description ? `\n\nDescription: ${description}` : ''}

Please help me set this up.`;

/**
 * Chat subject templates
 */
export const chatSubject = {
  default: 'Chat',
  projectCreation: 'Project Creation Request',
  statusUpdate: 'Status Update Request'
} as const;

/**
 * Generic chat message
 */
export const chatMessage = (message: string): string => message;

/**
 * Request status update
 */
export const statusUpdateRequest = (entityType: string, entityId: string): string => `Please reply with the current status of ${entityType} ${entityId} in JSON format:
{
  "status": {
    "id": "${entityId}",
    "type": "${entityType}",
    "current_status": "status-value",
    "last_updated": "timestamp",
    "details": {}
  }
}`;