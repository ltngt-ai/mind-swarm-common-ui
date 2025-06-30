/**
 * Email constants and timeouts for MindSwarm communication
 */

// Default UI agent email - this will be replaced by the user's specific UI agent
// email once the identity is confirmed by the backend
export const DEFAULT_UI_AGENT_EMAIL =
  "ui-agent@ui_agents.local.mind-swarm.ltngt.ai";

// Email domain for user accounts
export const USER_EMAIL_DOMAIN = "external.local.mind-swarm.ltngt.ai";

// Email domain for UI agents
export const UI_AGENT_EMAIL_DOMAIN = "ui-agents.ltngt.ai";

// Base domain - owned by the team in case emails escape
export const BASE_DOMAIN = "ltngt.ai";

// Timeout constants for UI operations
// High timeout needed until UI shortcuts are restored
export const UI_OPERATION_TIMEOUT_MS = 180000; // 3 minutes (same as DataService)

// Connection constants
export const DEFAULT_WEBSOCKET_TIMEOUT = 30000; // 30 seconds
export const DEFAULT_RECONNECT_INTERVAL = 5000; // 5 seconds
export const MAX_RECONNECT_ATTEMPTS = 10;

// Message deduplication window
export const MESSAGE_DEDUP_WINDOW_MS = 500;