# Graph Lifecycle

## 1. Load

`src/hooks/useSkillGraph.hook.ts` loads the graph from the backend using the route `versionId`.

Backend response shape:
- `nodes: []`
- `connections: {}`

During load, the hook:
- converts backend nodes into React Flow nodes
- preserves sub-flow parenting via `parentId` or `parentNode`
- sorts parent sub-flow nodes before children
- converts connection records into React Flow edges
- auto-injects an End node if none exists
- replaces the per-version `localStorage` cache with the loaded graph

## 2. Edit In Canvas

Canvas edits happen in `src/components/SkillDesignerCanvas/SkillDesignerCanvas.tsx` and `src/components/PropertiesDrawer/PropertiesDrawer.tsx`.

Key behavior:
- node drops create new nodes and write them to `localStorage`
- action-node drops may first create a placeholder and then replace it with API-enriched data
- edge creation writes a connection record to `localStorage`
- node drag stop persists the latest node position
- node and edge deletion remove related stored entries

## 3. Persist Local Cache

`src/services/skillGraphStorage.service.ts` stores graph state under:
- `skill_graph_<versionId>`

Stored shape:
- `nodes: Record<string, any>`
- `connections: Record<string, any>`

This cache is the editable working copy. It is not just a fallback; save depends on it.

## 4. Save To Backend

`saveGraph()` in `src/hooks/useSkillGraph.hook.ts` reads from `localStorage`, not from the React Flow instance directly.

Before save, it strips internal-only blobs from `node.data`, including:
- `inputsSchemaJson`
- `inputs_schema_json`
- `outputsSchemaJson`
- `outputs_schema_json`
- `executionJson`
- `execution_json`

Then it calls `saveSkillGraph()` in `src/services/graph.service.ts`.

## 5. Validate, Compile, Run, Publish, Generate Code

`src/services/graph.service.ts` exposes:
- `validateSkillGraph(versionId)`
- `compileSkillGraph(versionId)`
- `publishSkillVersion(versionId, notes?)`
- `runSkillVersion(versionId, inputContext, maxSteps?)`
- `generateCode(versionId)`

Relevant API namespaces are defined in `src/services/api.endpoints.ts`.

## Common Risks

### Placeholder Versus Enriched Action Nodes

Do not assume a dropped action node already has full backend metadata. `useCanvasDragDrop.hook.ts` may enrich it asynchronously after the initial render.

### Parent And Child Ordering

Do not break the sub-flow sort step in `useSkillGraph.hook.ts`. Children can render incorrectly if parent nodes do not exist first.

### Missing End Node

Do not assume the backend graph includes an End node. The UI adds one automatically for safety.

### Form-State To URL Sync

`PropertiesDrawer.tsx` has two-way sync between:
- `url`
- `path_params`
- `query_params`

If you change one part, verify the other two still update correctly.

### Edge Identity

Default edge IDs are built from source and target in the canvas. If connection identity rules change, verify save, delete, click, and reload behavior together.
