# Tensaw Skills Studio — Execution Roadmap v0.1

> **Strategy:** Frontend-first development using mock data, fully independent of backend. Backend phases follow. Final integration phase connects them via API contracts.

---

## Phase 1: Frontend Foundation & Mock Data Layer
**Goal:** Set up the React project and establish a mock data service that the entire UI will consume.

| Step | Detail |
|---|---|
| 1.1 | Initialize **React** application (Next.js or Vite) with project structure and routing. |
| 1.2 | Create a **Mock Data Service** layer — a set of static JSON files + a thin service abstraction (`/services/api.ts`) that the UI calls. All components fetch data through this layer, never directly from JSON files. |
| 1.3 | Seed mock data: sample Skills (various statuses), sample Action Definitions (various categories and capabilities), sample Connector Instances. |
| 1.4 | Implement global layout shell: top navigation bar (logo, search, client/payer/environment selectors, notifications, user avatar), sidebar container, main content area. |
| 1.5 | Set up shared design system: typography, color palette, status pills, badges, buttons, card components, form elements. |

**Outcome:** A running React app with a mock API layer and consistent design system. Swapping mock data for real API calls later requires changing only the service layer.

---

## Phase 2: Frontend — Skills Library & Create Skill
**Goal:** Build the browse/discover and skill creation experience.

| Step | Detail |
|---|---|
| 2.1 | Build the **Skills Library** page: left sidebar (status-filtered navigation with dynamic counts), card grid layout, search/filter bar, tab filters, pagination. |
| 2.2 | Build the **Create Skill** 2-step wizard modal — Step 1: name, key, description, category, tags, client, environment, owner; Step 2: start-from selection (blank/template/clone). |
| 2.3 | Wire both screens to the mock data service. Implement client-side filtering, sorting, and search against mock skill data. |
| 2.4 | Implement contextual card actions per status (Edit, Test, Publish, Delete, Archive). Wire navigation so "Edit" routes to the canvas page. |

**Outcome:** Fully interactive Skills Library with working creation flow, all running on mock data.

---

## Phase 3: Frontend — Visual Orchestrator Canvas
**Goal:** Build the core drag-and-drop canvas — the heart of the Studio.

| Step | Detail |
|---|---|
| 3.1 | Integrate `@xyflow/react` for the center canvas pane. |
| 3.2 | Build the **Left Panel** (Node Library / Palette) — categorized, collapsible list of available actions fetched from mock Action Catalog data. Implement drag-and-drop onto canvas. |
| 3.3 | Build custom **node renderers** for each node type category (trigger, action, connector, end) with color-coded icons and connector binding indicators. |
| 3.4 | Build the **Right Panel** (Properties Drawer) — dynamically generates a form based on the selected node's mock `ui_form_json` schema. Includes input/output mapping, connector selection, threshold controls, and connection management. |
| 3.5 | Implement **routing on edges** — conditional, unconditional, and default/fallback routes with visible condition labels. |
| 3.6 | Implement canvas tabs (Design, Logic, Test Case, Monitoring), view mode toggles, entry metadata strip, zoom controls, minimap, and bottom bar. |
| 3.7 | Build the **Top Bar** — back navigation, skill reference (key + name), status pill, version indicator, and Save/Test/Publish action buttons. |
| 3.8 | Wire the canvas to mock data: load a pre-built sample graph on mount, persist graph state changes to local state or localStorage. |

**Outcome:** Fully functional visual editor where workflows can be designed by drag-and-drop, all running on mock data.

---

## Phase 4: Frontend — Action Catalog Admin UI
**Goal:** Build the admin screens for browsing and creating Action Definitions.

| Step | Detail |
|---|---|
| 4.1 | Build the **Action Catalog Browse** screen: left sidebar (status filters with counts + dynamic category tree), search/filter bar, right-side action card list, pagination. |
| 4.2 | Build the **Create Action 7-step wizard**: Overview → Inputs → Execution → Outputs → UI Form → Policy → Review. Include the live Action Definition Preview panel. |
| 4.3 | Wire to mock data service. Newly "created" actions should appear in the Node Library palette on the canvas. |

**Outcome:** Complete admin experience for defining reusable actions, all on mock data.

---

## Phase 5: Backend — API & Data Model
**Goal:** Build the real backend that matches the API contract the frontend already consumes.

| Step | Detail |
|---|---|
| 5.1 | Initialize **FastAPI** (Python) server with database (SQLite for dev, PostgreSQL for prod). |
| 5.2 | Implement full data model: `skill`, `skill_version`, `skill_node`, `skill_route`, `skill_node_action`, `action_definition`, `action_version`, `connector_instance`, `prompt_template`, `prompt_version`, `skill_test_case`, `skill_run`, `tag`, `skill_tag`. |
| 5.3 | Build Skill CRUD endpoints matching the frontend's mock service contract: create (blank/template/clone), list with filters, load graph, save graph, update node config. |
| 5.4 | Build Action Catalog CRUD endpoints: create/update action definition, create/publish action version (immutable on publish), list with filters. |
| 5.5 | Build JSON Schema validation layer — ensure saved node `config_json` adheres to the action's defined input contract. |
| 5.6 | Implement role-based permissions scaffold (`viewer` / `editor` / `publisher` / `admin`) and environment gating. |

**Outcome:** A running backend API with the exact same contract the frontend was already built against.

---

## Phase 6: Integration & Compilation
**Goal:** Replace mock data with real API calls, implement the compiler and Git Bridge.

| Step | Detail |
|---|---|
| 6.1 | Swap the frontend **Mock Data Service** to point at the real backend API endpoints. No UI code changes should be needed — only the service layer changes. |
| 6.2 | Build the **Compiler module** — takes a `skill_version_id`, traverses all `skill_node` and `skill_route` entries, produces `compiled_skill_json` + `compile_hash`. |
| 6.3 | Implement **strict validation gating**: detached nodes, missing required inputs, unreachable nodes, missing default routes on decision nodes, schema adherence. |
| 6.4 | Implement the **Git Bridge** — on publish, commit and push compiled JSON to the configured Git repository. |

**Outcome:** End-to-end flow from visual graph → real database → compiled JSON → Git repository.

---

## Phase 7: Sandbox Testing & Polish
**Goal:** Allow users to safely test skills and polish the overall experience.

| Step | Detail |
|---|---|
| 7.1 | Implement a **Test Run** modal with sample input event configuration. |
| 7.2 | Create a mock execution loop in the backend that traverses compiled JSON against mocked endpoints. |
| 7.3 | Prompt management integration — linking/editing prompt versions from AI node property panels. |
| 7.4 | UI polish: error states, loading indicators, inline validation, micro-animations, responsive edge cases. |

**Outcome:** End-to-end authoring experience: browse → create → design → test → publish.

---

## Priority & CEO Guidance (March 2 Meeting)

> *"The heart is this [the canvas]. If you get this, then everything else is simply supporting screens."*

**Immediate focus:** Phase 3 (The Canvas) is the priority POC. Phases 1–2 provide just enough scaffolding to support it. The frontend can be fully demonstrated with mock data before any backend work begins.
