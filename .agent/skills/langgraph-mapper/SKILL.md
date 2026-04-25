---
name: langgraph-mapper
description: Assist in mapping UI nodes to LangGraph execution flows and UI designs. Use this skill when dealing with execution flow, node types, and LangGraph architectures.
---
# LangGraph Mapper

This skill provides context and references for translating Tensaw Skills Studio UI nodes into LangGraph execution flows.

## Agents

We have two specialized agents defined within this skill workspace:
- `execution-flow.yaml`: Defines how to execute the workflow logically.
- `ui-design.yaml`: Defines the visual design semantics and properties of the nodes.

## References

Please consult the following reference documents:
- `references/node-types.md`: Details each node type (e.g. Start, End, Action, Decision) and its properties.
- `references/langgraph-mapping.md`: Describes how properties from the UI map directly to LangGraph concepts.
- `references/repo-map.md`: Contains the paths and architecture of the Tensaw Skills Studio repository.
