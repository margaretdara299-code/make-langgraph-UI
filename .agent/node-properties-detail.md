# Node Properties Detail

The Node Properties panel (Properties Drawer) is the primary interface for configuring selected nodes in the Skill Designer.

## Structure
- **Header**: Contains the node icon (Lucide) and Title.
- **Tabs**:
  - **General**: Identity (Label, Description) and Metadata (ID, Type, Engine).
  - **Configuration**: Node-specific parameters (URLs, Headers, JSON configs).
  - **Settings**: Advanced settings like Fallback messages and State Mapping.

## Design System
- **Background**: `var(--bg-card)`
- **Typography**: `var(--font-sans)` (Inter)
- **Rounded Corners**: Header and metadata badges use `var(--radius-sm)`.
- **Border**: `1px solid var(--border-light)` separating sections.

## Components
- **IconRenderer**: Dynamically loads Lucide icons.
- **DecisionPropertiesPanel**: Specialized configuration for routing logic.
- **DynamicParamList**: Reusable component for KV-pair configurations (Path, Query, Headers, Body).
