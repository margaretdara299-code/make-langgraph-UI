# Repo Map

## Stack

- React 19
- TypeScript
- Vite
- Ant Design
- TanStack Query
- React Flow via `@xyflow/react`

## Main Product Areas

### App Shell And Routes

- `src/App.tsx`
- `src/routes/routes.config.ts`
- `src/layouts/MainLayout/`

Important route:
- `'/skills/:skillId/versions/:versionId/design'` is the skill designer workspace.

### Designer Workspace

- `src/pages/SkillDesigner/SkillDesignerPage.tsx`
- `src/components/SkillDesignerCanvas/SkillDesignerCanvas.tsx`
- `src/components/SkillDesignerHeader/SkillDesignerHeader.tsx`
- `src/components/NodePalette/`
- `src/components/PropertiesDrawer/`

This is the canvas-based workflow editor. It owns node selection, edge selection, drawer opening, drag and drop, and React Flow setup.

### Node Registry And Node Components

- `src/constants/canvas-nodes.constants.tsx`
- `src/components/ActionNode/`
- `src/components/TriggerNode/`
- `src/components/ConnectorNode/`
- `src/components/StartNode/`
- `src/components/DecisionNode/`
- `src/components/SubFlowNode/`
- `src/components/EndNode/`
- `src/components/DeletableEdge/`

If a node stops rendering or a new type is not recognized, check the registry first.

### Hooks

- `src/hooks/useSkillGraph.hook.ts`: load backend graph, hydrate local state, expose save
- `src/hooks/useCanvasDragDrop.hook.ts`: create nodes from palette drops
- `src/hooks/useDesignerActions.hook.ts`: fetch grouped actions for the palette
- `src/hooks/useDesignerConnectors.hook.ts`: connector palette behavior if used

### Services

- `src/services/api.endpoints.ts`: backend URL map
- `src/services/http.service.ts`: HTTP client
- `src/services/action.service.ts`: action catalog and action-detail APIs
- `src/services/connector.service.ts`: connector APIs
- `src/services/graph.service.ts`: load, save, validate, compile, publish, run, generate code
- `src/services/skillGraphStorage.service.ts`: per-version `localStorage` cache

### Entity Pages Outside The Designer

- `src/pages/SkillsLibrary/`
- `src/pages/ActionCatalog/`
- `src/pages/Connectors/`
- `src/pages/Categories/`
- `src/pages/Capabilities/`

These pages usually own list, create, edit, and catalog flows for entities that later appear inside the designer.

## Typical Change Entry Points

### Add A Node Field

Touch:
- node data mapping in `useCanvasDragDrop.hook.ts` if the field comes from the backend or palette
- `PropertiesDrawer.tsx` to load and edit the field
- save path if the field must survive `localStorage` to backend serialization

### Add A Node Type

Touch:
- a new node component under `src/components/`
- `src/constants/canvas-nodes.constants.tsx`
- palette files under `src/components/NodePalette/`
- drawer logic if the node needs properties

### Change Save Or Compile Behavior

Touch:
- `src/hooks/useSkillGraph.hook.ts`
- `src/services/graph.service.ts`
- optionally execution or code viewer components

### Change Action Metadata Shown In Canvas

Touch:
- `src/services/action.service.ts`
- `src/hooks/useDesignerActions.hook.ts`
- `src/hooks/useCanvasDragDrop.hook.ts`
- node component rendering

## External Project Notes In `.agent`

- `../design-flow-detail.md`: UI-only redesign rules
- `../header-detail.md`: header design notes
- `../sidebar-detail.md`: sidebar design notes

Use them when the request is visual or layout-oriented.
