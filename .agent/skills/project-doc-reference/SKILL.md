---
name: project-doc-reference
description: The single source of truth for the Tensaw Skills Studio UI architecture. Trigger this skill whenever you need to understand the project structure, routing, state management, or UI best practices before implementing new features.
---
# Project Documentation Reference

The architectural rules, standards, and references for this React frontend are stored via an indexed Progressive Disclosure pattern in the `docs/frontend/` directory.

## How to use the Project Documentation:

Whenever you are tasked with adding a major feature, debugging core architecture, or utilizing unfamiliar patterns in this repository, you must consult the indexed documentation.

1. **Locate the Index**: Read the primary index file located at `docs/frontend/frontend_index.md`.
2. **Find the Topic**: Scan the Table of Contents in `frontend_index.md` to find the documentation module relevant to your task (e.g., Routing, API Integration, Custom Hooks).
3. **Read specific references**: You MUST read the specific file referenced in the index (e.g., `docs/frontend/07-state-management.md`) before writing any logic to ensure you match the established development patterns.

## When you MUST reference the documentation:

* **Creating new Pages/Views**: Check `03-components.md` and `04-folder-structure.md`.
* **Connecting to APIs**: Check `07-state-management.md` and `08-api-integration.md` to use TanStack properly instead of raw `useEffect`.
* **Styling**: Always read `02-ui-ux.md` and `15-best-practices.md` to respect the High-Density SaaS requirements.
* **Troubleshooting**: Check `12-testing-debugging.md` for known quirks with React Flow and Framer Motion. 

By tying your context gathering to this directory, you prevent architecture drift and keep the codebase consistent.
