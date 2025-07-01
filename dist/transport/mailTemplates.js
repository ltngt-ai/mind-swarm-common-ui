/**
 * Mail Templates - Human-editable mail message templates
 *
 * This module contains all the mail templates used to communicate with agents.
 * Each template should be clear, specific, and include the word "reply".
 */
/**
 * Request project list
 */
export const listProjectsRequest = () => `Please reply with subject "Project List Response" and a list of all projects in the following JSON format:
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
export const listTasksRequest = (projectId) => `Please reply with a list of all tasks in project ${projectId} in the following JSON format:
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
export const listAllTasksRequest = () => `Please reply with a list of all tasks across all projects in the following JSON format:
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
export const listAgentsRequest = (scope) => {
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
export const deleteProjectRequest = (projectId, projectName) => ({
    subject: `Request: Delete Project ${projectName}`,
    body: `Please delete the entire project folder for project ID: ${projectId} ("${projectName}").`
});
/**
 * Request detach project
 */
export const detachProjectRequest = (projectId, projectName) => ({
    subject: `Request: Detach Project ${projectName}`,
    body: `Please detach project ID: ${projectId} ("${projectName}") from this UI. Only remove the .mind-swarm folder.`
});
/**
 * Initiate project creation conversation
 */
export const initiateProjectCreation = () => `I want to work on a new project`;
/**
 * Create project request
 */
export const createProjectRequest = (name, description) => `I want to work on a project called "${name}".${description ? `\n\nDescription: ${description}` : ''}

Please help me set this up.`;
/**
 * Chat subject templates
 */
export const chatSubject = {
    default: 'Chat',
    projectCreation: 'Project Creation Request',
    statusUpdate: 'Status Update Request'
};
/**
 * Generic chat message
 */
export const chatMessage = (message) => message;
/**
 * Request status update
 */
export const statusUpdateRequest = (entityType, entityId) => `Please reply with the current status of ${entityType} ${entityId} in JSON format:
{
  "status": {
    "id": "${entityId}",
    "type": "${entityType}",
    "current_status": "status-value",
    "last_updated": "timestamp",
    "details": {}
  }
}`;
//# sourceMappingURL=mailTemplates.js.map