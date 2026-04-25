# Node Types

This document outlines the standard nodes supported in the Tensaw Skills Studio UI and their equivalent LangGraph mapping.

## General Structure
Every node consists of metadata like `id`, `position`, `type`, and `data`. The specific payload that feeds into the LangGraph executor resides within the `data` property.

## 1. Start Node
- **Type**: `start`
- **Purpose**: Defines the `StateGraph` initialization state and entry point.
- **Properties**: 
  - `label`: Name of the node.
  - `initial_state`: An array of key-value pairs (`key`, `type`, `value`) establishing the schema for the execution State.

## 2. End Node
- **Type**: `end`
- **Purpose**: A graph exit node containing final formatting procedures or failure fallback procedures.
- **Properties**:
  - `response_format`: Either `auto` or `custom`.
  - `custom_message`: A JSON or text literal defining the final response payload to the caller if `response_format` is `custom`.
  - `fail_status_code`: Code to return if reached in a failure state.
  - `fail_message`: Default message.

## 3. Action Node
- **Type**: `action`
- **Purpose**: Represents an external API call, custom integration, or data manipulation function.
- **Properties**:
  - `label` / `name`: Strictly mirror the action string key.
  - `configurations_json`: Specific parameters passed into this execution block.
  - `response_to_state_mapping`: How the resulting output merges back into the LangGraph global state.

## 4. Decision Node
- **Type**: `decision`
- **Purpose**: Used for dynamic graph conditional edge branching.
- **Properties**:
  - `rules`: Array of logic evaluations against global state keys to determine next node pathways.

## 5. Connector Node
- **Type**: `connector`
- **Purpose**: Templated external tools (e.g. standard REST calls, SMTP).
- **Properties**:
  - `url`, `method`, `path_params`, `query_params`, `header_params`, `body_params`.

## 6. Error Node
- **Type**: `error`
- **Purpose**: A catch-all handler for edge faults or explicit errors during execution, routing to an API (`error_api_url`).

## 7. Subflow Node
- **Type**: `subflow`
- **Purpose**: Represents a subgraph that encapsulates a modular sequence within a separate graph definition block.
