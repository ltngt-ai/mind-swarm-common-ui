# @mind-swarm/common-ui

Shared utilities and transport layer for MindSwarm CLI and Web UI applications.

## Overview

This package provides common functionality shared between the MindSwarm web and CLI interfaces:

- **Mail Transport Protocol**: RFC2822-based communication with backend agents
- **Type Definitions**: Shared TypeScript interfaces for entities, mail, auth, and UI
- **Authentication Service**: Framework-agnostic JWT token lifecycle management
- **Utilities**: JSON parsing, RFC2822 helpers, and configuration management

## Installation

```bash
npm install @mind-swarm/common-ui
```

## Usage

### Types

```typescript
import { Project, Agent, Task, Mail, AuthSession } from '@mind-swarm/common-ui/types';
```

### Mail Transport

```typescript
import { MailQueue, mailTemplates, constants } from '@mind-swarm/common-ui/transport';

// Create a mail queue
const queue = new MailQueue({
  dedupeWindowMs: 500,
  maxAttempts: 3
});

// Use mail templates
const projectListRequest = mailTemplates.listProjectsRequest();
```

### Authentication

```typescript
import { AuthServiceBase } from '@mind-swarm/common-ui/services';

// Extend for your platform
class MyAuthService extends AuthServiceBase {
  // Platform-specific implementation
}
```

### Utilities

```typescript
import { parseMarkdownJson, generateMessageId, mergeConfig } from '@mind-swarm/common-ui/utils';
```

## Architecture

This package follows agent-first principles:
- All operations use mail-based communication
- No direct CRUD operations
- Natural language interfaces preferred
- Framework-agnostic core with platform-specific extensions

## Development

```bash
npm install        # Install dependencies
npm run build      # Build TypeScript
npm run dev        # Watch mode
npm test           # Run tests
```

## License

MIT