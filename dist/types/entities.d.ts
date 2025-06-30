/**
 * Core entity types shared between CLI and Web UI
 */
export interface Project {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'archived';
    description?: string;
    agents_count?: number;
    tasks_count?: number;
    created_at?: string;
    updated_at?: string;
}
export interface Agent {
    id: string;
    name: string;
    type: string;
    status: 'online' | 'offline' | 'idle' | 'busy';
    mailbox: string;
    description?: string;
    project_id?: string;
    capabilities?: string[];
    last_seen?: string;
}
export interface Task {
    id: string;
    project_id: string;
    name: string;
    type: 'recurring' | 'oneshot';
    status: 'running' | 'pending' | 'completed' | 'failed';
    progress: number;
    description?: string;
    assigned_agent_id?: string;
    created_at?: string;
    updated_at?: string;
    deadline?: string;
}
//# sourceMappingURL=entities.d.ts.map