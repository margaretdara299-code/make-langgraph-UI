# Repository Map

Key files related to the UI and Execution flow mapping in the Tensaw Skills Studio UI:

## Front End (`src/`)

- `src/pages/Designer/Designer.tsx`: The primary React Flow canvas handling layout, drag-and-drop orchestration, and base execution mappings.
- `src/components/ExecutionDebuggerModal/ExecutionDebuggerModal.tsx`: Real-time debugger visualizing run-time LangGraph execution paths.
- `src/components/PropertiesDrawer/PropertiesDrawer.tsx`: Flyout configuration menu rendering forms natively tied to execution capabilities based on internal graph types (decision rules, api mapping).
- `src/components/DesignerSidebar/DesignerSidebar.tsx`: Library containing selectable core nodes to inject into the execution engine.
- `src/services/action.service.ts`: Backend service syncing available actions with canvas configuration requirements.
- `src/services/groups.service.ts`: Services that manage variable groups accessible by state mapping tools.
- `src/App.css`: Central aesthetics holding SaaS color variables and semantic utility classes for all elements.
