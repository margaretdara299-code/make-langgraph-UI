# LangGraph Mapping Architecture

This reference outlines the bridge between UI canvas components and the underlying LangGraph framework execution models.

## 1. Graph State Compilation
- **Source**: Target canvas Start node (`type: 'start'`).
- **Mapping**: 
  The `initial_state` array defined in the Start node's data defines the schema of the LangGraph `StateGraph`. 
  Each key is assigned its designated `type` along with the `value` serving as the initialized default within the graph memory.

## 2. Nodes to Agents
- **Source**: Target canvas Action/Decision/Flow nodes (`type: 'action' | 'decision' | 'connector' | 'subflow'`).
- **Mapping**:
  Each node maps directly to a node constructor function on the backend `StateGraph`. 
  For example: `graph.add_node(nodeId, action_tool_execution)`. 
  The configuration arrays sent with the node instruct the execution tool inside LangGraph on how to behave.

## 3. Edges to Routing Logic
- **Source**: Canvas Edges linking Node A and Node B.
- **Mapping**:
  1. Default Edge: Translates to standard `graph.add_edge(A, B)`.
  2. Conditional Edge (`routeType="conditional"`): Sent to `graph.add_conditional_edges(A, routing_function)`. The `routing_function` uses `conditionLabel` and Decision Node rules to decide the runtime path based on graph state.
  3. Fallback Route (`routeType="fallback"`): Set as the catchall in the `add_conditional_edges` branch maps.

## 4. State Updates
- **Source**: `response_to_state_mapping` array inside Action configuration.
- **Mapping**:
  After a node tool returns its result, LangGraph compares the returned variables against the node's explicit schema map (`source_path` -> `state_key`).
  This populates the graph state prior to triggering the successor node in the chain.

## 5. End States & Interruption
- **Source**: End / Error nodes.
- **Mapping**:
  Graphs finish sequentially at End Nodes, returning defined payload forms (`response_format`). Error nodes inject global `try/catch` fallbacks to execute `graph.interrupt` or direct to configured fallback destinations.
