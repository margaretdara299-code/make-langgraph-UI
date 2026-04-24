---
name: tensaw-skills-studio-ui
description: Project-specific guide for the Tensaw Skills Studio UI repository, a React and Vite visual workflow builder that edits LangGraph-style skill graphs with a canvas, draggable action nodes, connectors, node properties, edge routing, execution debugging, and generated code. Use when Codex needs to modify the skill designer canvas, node or edge behavior, properties drawer forms, graph persistence, action or connector API integration, skill version compile or run flows, or UI-only refinements in this codebase.
---

# Tensaw Skills Studio UI

## Quick Start

Read `references/repo-map.md` before editing unfamiliar areas.

Read `references/graph-lifecycle.md` before changing canvas state, persistence, save, compile, run, or generated-code flows.

For UI-only redesign or polish work, also read `../design-flow-detail.md`. If the task is specifically about shell chrome, also read `../header-detail.md` and `../sidebar-detail.md`.

Use this skill for requests like:
- "Update the skill designer canvas"
- "Add or change a node property"
- "Fix action node save behavior"
- "Wire a new action or connector API field into the builder"
- "Adjust graph compile, run, publish, or generated-code flow"
- "Restyle the builder without changing behavior"

## Working Rules

Treat the backend graph as the source of truth on initial load. Treat `localStorage` as the editable cache after hydration and before save.

Preserve the current split between page wrapper, canvas, drag-drop hook, properties drawer, and service layer. Do not collapse everything into one file.

Preserve backend field compatibility. This codebase intentionally carries both snake_case and camelCase variants in several places because API payloads are inconsistent.

Keep sub-flow parent handling intact. Parent nodes must exist before children, and child nodes use `parentId` plus `extent: 'parent'`.

Do not assume the backend always sends an End node. The UI auto-injects one if missing.

When editing the properties drawer, preserve the URL, path param, and query param synchronization logic.

For UI-only tasks, keep routing, data flow, API boundaries, hooks, modal behavior, and graph logic unchanged unless the user explicitly asks for behavior changes.

## Task Guide

### Canvas And Node Work

Start in:
- `src/pages/SkillDesigner/SkillDesignerPage.tsx`
- `src/components/SkillDesignerCanvas/SkillDesignerCanvas.tsx`
- `src/hooks/useCanvasDragDrop.hook.ts`
- `src/constants/canvas-nodes.constants.tsx`

Use this path when:
- adding a node type
- changing drag-and-drop behavior
- changing edge creation or deletion
- changing canvas interactions, zoom, minimap, background, or selection behavior

When adding a node type, usually update:
- the node component under `src/components/`
- `src/constants/canvas-nodes.constants.tsx`
- the node palette under `src/components/NodePalette/`
- properties editing under `src/components/PropertiesDrawer/`
- any relevant interfaces or constants

### Node Properties And Routing

Start in:
- `src/components/PropertiesDrawer/PropertiesDrawer.tsx`
- `src/components/PropertiesDrawer/DecisionPropertiesPanel.tsx`
- `src/components/DeletableEdge/DeletableEdge.tsx`

Use this path when:
- adding a configurable field to an action, trigger, connector, start, decision, or sub-flow node
- changing edge route labels or conditional routing
- changing how form edits update React Flow state and `localStorage`

Remember that form edits update the live React Flow instance immediately and then sync to `localStorage`.

### Action, Connector, And API Work

Start in:
- `src/services/action.service.ts`
- `src/services/connector.service.ts`
- `src/services/graph.service.ts`
- `src/services/api.endpoints.ts`
- `src/hooks/useDesignerActions.hook.ts`

Use this path when:
- wiring new backend fields into nodes
- changing how palette items are fetched
- adjusting save, validate, compile, publish, run, or generated-code requests
- working on action creation or catalog flows

Treat each action node as API-backed. Drag-drop can create a placeholder node first, then enrich it asynchronously with full action details from the backend.

### Graph Persistence And Execution

Start in:
- `src/hooks/useSkillGraph.hook.ts`
- `src/services/skillGraphStorage.service.ts`
- `src/services/graph.service.ts`
- `src/components/ExecutionDebuggerModal/`
- `src/components/GeneratedCodeViewer/`

Use this path when:
- fixing load or save bugs
- changing `localStorage` shape
- changing validate, compile, run, publish, or generate-code behavior
- debugging why edited node data is missing from saved graphs

Save behavior currently reads from `localStorage`, not directly from in-memory React Flow state.

## Verification

Prefer `npm run build` after structural changes.

Run `npm run lint` when touching TypeScript or React logic that may introduce style or hook issues.

If the task is canvas-heavy, verify:
- node drag and drop still works
- node edits persist after selection changes
- edges still save and reload
- sub-flow children stay positioned correctly
- save and reload preserve the intended graph

## References

Read `references/repo-map.md` for file ownership and entry points.

Read `references/graph-lifecycle.md` for graph hydration, edit, save, and execution behavior.

Read `../design-flow-detail.md` for presentation-only redesign constraints.
