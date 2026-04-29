/**
 * SkillDesignerCanvas — The core React Flow canvas area.
 * Extracted from the page wrapper to maintain separate component responsibilities.
 */

import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    type OnConnect,
    type Node,
    type Edge,
    type ReactFlowInstance,
    MarkerType,
    BackgroundVariant,
    useReactFlow,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import NodePalette from '@/components/NodePalette/NodePalette';
import PropertiesDrawer from '@/components/PropertiesDrawer/PropertiesDrawer';
import { NODE_TYPES, EDGE_TYPES } from '@/constants';
import { useExecution } from '@/contexts';
import { useCanvasDragDrop, useSkillGraph } from '@/hooks';
import {
    upsertNodeInStorage,
    upsertConnectionInStorage,
    removeNodeFromStorage,
    removeConnectionFromStorage,
    upsertViewportInStorage,
} from '@/services/skillGraphStorage.service';
import type { CanvasNode } from '@/interfaces';
import { getNodeStrokeColor, isErrorConnectorEdge } from '@/utils';
import './SkillDesignerCanvas.css';

export default function SkillDesignerCanvas() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { initialNodes, initialEdges, initialViewport, versionId } = useSkillGraph();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    // Sync nodes/edges when loaded asynchronously
    useEffect(() => {
        if (initialNodes && initialNodes.length > 0) {
            setNodes(initialNodes);
            // Re-fit or set view after nodes are applied, with a small delay for layout
            if (reactFlowInstance) {
                setTimeout(() => {
                    const hasViewport = initialViewport && (initialViewport.x !== 0 || initialViewport.y !== 0 || initialViewport.zoom !== 1);
                    if (hasViewport) {
                        reactFlowInstance.setViewport(initialViewport, { duration: 400 });
                    } else {
                        reactFlowInstance.fitView({ padding: 0.3, maxZoom: 0.85, duration: 400 });
                    }
                }, 100);
            }

        }
        if (initialEdges && initialEdges.length > 0) {
            setEdges(initialEdges);
        }
    }, [initialNodes, initialEdges, initialViewport, setNodes, setEdges, reactFlowInstance]);


    // Track which node or edge is actively opened in the properties drawer
    const [drawerNodeId, setDrawerNodeId] = useState<string | null>(null);
    const [drawerEdgeId, setDrawerEdgeId] = useState<string | null>(null);

    // Track which subflow group is being hovered over during a drag (for visual highlighting)
    const [draggedOverGroupId, setDraggedOverGroupId] = useState<string | null>(null);

    // Access React Flow's internal API for intersection detection
    const { getIntersectingNodes } = useReactFlow();

    // Call our extracted drag & drop hook
    const { onDragOver, onDrop } = useCanvasDragDrop(reactFlowInstance, setNodes, nodes);

    /** Connect two nodes — follows the official @xyflow/react pattern exactly.
     *
     * KEY RULE: do NOT put `nodes` in the dependency array.
     * Every time `nodes` changes (node dragged, rule added, etc.) useCallback
     * recreates this function. React Flow receives a new reference and briefly
     * holds a stale handler — connections dragged during that window are silently
     * dropped. The default handle appeared to "work" by coincidence (its path
     * through the handler was trivially fast / didn't read stale node data).
     *
     * Solution: mirror the official example — just spread params + styling props.
     * Use a timestamp-unique ID so each handle's edge is always distinct.
     */
    const onConnect: OnConnect = useCallback(
        (params) => {
            const sourceNode = reactFlowInstance?.getNode(params.source);
            const targetNode = reactFlowInstance?.getNode(params.target);
            const edgeColor = getNodeStrokeColor(sourceNode);
            const edgeId = [
                'edge',
                params.source,
                params.sourceHandle ?? 'src',
                params.target,
                params.targetHandle ?? 'tgt',
                Date.now(),
            ].join('__');

            // Edges that come from a named rule handle originate from a DecisionNode.
            // Must explicitly exclude "default" — Boolean("default") === true would
            // incorrectly tag the fallback path as a branch edge (amber vs grey).
            // Also exclude Split node handles — those are parallel (not conditional exclusive).
            const isFromSplitNode = sourceNode?.type === 'parallel_split';
            const fromDecision = !isFromSplitNode
                && Boolean(params.sourceHandle)
                && params.sourceHandle !== 'default'
                && params.sourceHandle !== 'src'
                && params.sourceHandle !== 'error';

            // Parallel branch edges originate from a Split node's named handles
            const isParallelBranch = isFromSplitNode && Boolean(params.sourceHandle);

            // Edges from the action node's `error` handle route to the Error Node.
            // Edges originating from the Error Node route to the End Node.
            // Both should use the dotted red error path styling.
            const isErrorPath = params.sourceHandle === 'error' || sourceNode?.type === 'error' || targetNode?.type === 'error';

            // Parallel branch edges use the split node's theme colour (pink/magenta)
            const parallelBranchColor = 'var(--color-node-split, #ec4899)';

            setEdges((eds) => addEdge({
                ...params,
                id: edgeId,
                type: 'smoothstep',
                animated: false,
                data: { fromDecision, isErrorPath, isParallelBranch, branchId: params.sourceHandle },
                markerEnd: fromDecision
                    ? undefined
                    : isErrorPath
                        ? { type: MarkerType.ArrowClosed, color: 'var(--color-error)' }
                        : isParallelBranch
                            ? { type: MarkerType.ArrowClosed, color: parallelBranchColor }
                            : { type: MarkerType.ArrowClosed, color: edgeColor },
                style: isErrorPath
                    ? {
                        stroke: 'var(--color-error)',
                        strokeWidth: 1.5,
                        strokeDasharray: '6 3',
                    }
                    : isParallelBranch
                        ? {
                            stroke: parallelBranchColor,
                            strokeWidth: 1.5,
                            strokeDasharray: '4 3',
                        }
                        : {
                            stroke: edgeColor,
                            strokeWidth: fromDecision ? 2 : 1.5,
                        },
            }, eds));

            if (versionId) {
                upsertConnectionInStorage(versionId, edgeId, {
                    id: edgeId,
                    source: params.source,
                    sourceHandle: params.sourceHandle,
                    target: params.target,
                    targetHandle: params.targetHandle,
                });
            }
        },
        [reactFlowInstance, setEdges, versionId]
    );


    // ── Dynamic Parent-Child Attach / Detach ──
    //
    // When a node is dragged:
    //   • onNodeDrag  → find any overlapping subflow and highlight it
    //   • onNodeDragStop → commit the attach/detach:
    //       DETACH: node was a child and is now dragged outside its parent bounds
    //               → convert relative position to absolute, remove parentId + extent
    //       ATTACH: free node dragged into a subflow
    //               → convert absolute position to relative, assign parentId + extent:'parent'

    const onNodeDrag = useCallback(
        (_: React.MouseEvent, node: Node) => {
            // Only handle non-subflow nodes
            if (node.type === 'subflow') return;

            // Find any subflow node that intersects the dragged node
            const overlapping = getIntersectingNodes(node).find(n => n.type === 'subflow');
            setDraggedOverGroupId(overlapping?.id ?? null);
        },
        [getIntersectingNodes]
    );

    const onNodeDragStop = useCallback(
        (_: React.MouseEvent, node: Node) => {
            // Clear the hover highlight regardless
            setDraggedOverGroupId(null);

            // Subflow containers themselves don't re-parent
            if (node.type === 'subflow') {
                if (versionId) {
                    const latestNode = nodes.find(n => n.id === node.id) || node;
                    upsertNodeInStorage(versionId, node.id, latestNode);
                }
                return;
            }

            // Find the subflow that spatially contains the dropped node
            const overlapping = getIntersectingNodes(node).find(n => n.type === 'subflow');
            const currentParentId = node.parentId;

            setNodes(nds => {
                return nds.map(n => {
                    if (n.id !== node.id) return n;

                    // ── CASE 1: DETACH ──
                    // Node already has a parent but is now dropped outside every subflow
                    if (currentParentId && !overlapping) {
                        const parent = nds.find(p => p.id === currentParentId);
                        const parentPos = parent?.position ?? { x: 0, y: 0 };

                        // Convert relative → absolute position
                        const absolutePosition = {
                            x: parentPos.x + node.position.x,
                            y: parentPos.y + node.position.y,
                        };

                        const detachedNode: Node = {
                            ...n,
                            position: absolutePosition,
                            parentId: undefined,
                            extent: undefined,   // 🔑 Remove extent constraint dynamically
                        };

                        if (versionId) upsertNodeInStorage(versionId, detachedNode.id, detachedNode);
                        return detachedNode;
                    }

                    // ── CASE 2: ATTACH (or re-parent) ──
                    // Node is over a subflow that is different from its current parent
                    if (overlapping && overlapping.id !== currentParentId) {
                        const parent = nds.find(p => p.id === overlapping.id);
                        const parentPos = parent?.position ?? { x: 0, y: 0 };

                        // If previously a child of a different group, convert through absolute first
                        let absoluteX = node.position.x;
                        let absoluteY = node.position.y;
                        if (currentParentId) {
                            const oldParent = nds.find(p => p.id === currentParentId);
                            const oldParentPos = oldParent?.position ?? { x: 0, y: 0 };
                            absoluteX = oldParentPos.x + node.position.x;
                            absoluteY = oldParentPos.y + node.position.y;
                        }

                        // Convert absolute → relative to new parent
                        const relativePosition = {
                            x: absoluteX - parentPos.x,
                            y: absoluteY - parentPos.y,
                        };

                        const attachedNode: Node = {
                            ...n,
                            position: relativePosition,
                            parentId: overlapping.id,
                            extent: 'parent' as const,   // 🔑 Set extent constraint dynamically
                        };

                        if (versionId) upsertNodeInStorage(versionId, attachedNode.id, attachedNode);
                        return attachedNode;
                    }

                    // ── CASE 3: NO CHANGE — just persist updated position ──
                    if (versionId) upsertNodeInStorage(versionId, n.id, n);
                    return n;
                });
            });
        },
        [getIntersectingNodes, nodes, setNodes, versionId]
    );

    /** Memoize node/edge types to avoid re-renders */
    const nodeTypes = useMemo(() => NODE_TYPES, []);
    const edgeTypes = useMemo(() => EDGE_TYPES, []);

    // ── Live Execution Animation Interception ──
    const { steps, isExecuting, isSimulationDone } = useExecution();

    const displayNodes = useMemo(() => {
        // ── Base: apply execution status highlights ──
        const executionNodes = (() => {
            if (!isExecuting && !isSimulationDone) return nodes;
            return nodes.map(node => {
                const step = steps.find(s => s.node.id === node.id);
                if (!step) {
                    return { ...node, style: { ...node.style, opacity: 0.25 } } as CanvasNode;
                }
                return {
                    ...node,
                    data: { ...node.data, executionStatus: step.status }
                } as CanvasNode;
            });
        })();

        // ── Layer: highlight the subflow group being hovered during a drag ──
        if (!draggedOverGroupId) return executionNodes;

        return executionNodes.map(node => {
            if (node.id !== draggedOverGroupId) return node;
            return {
                ...node,
                style: {
                    ...node.style,
                    outline: '2px dashed var(--color-primary)',
                    outlineOffset: '4px',
                    boxShadow: '0 0 12px 2px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                },
            };
        });
    }, [nodes, steps, isExecuting, isSimulationDone, draggedOverGroupId]);

    const displayEdges = useMemo(() => {
        if (!isExecuting && !isSimulationDone) return edges;

        return edges.map(edge => {
            let isPathActive = false;
            let status = 'idle';
            const isErrorPath = isErrorConnectorEdge(edge, nodes);
            const strokeDasharray = isErrorPath ? '6 3' : edge.style?.strokeDasharray;

            for (let i = 0; i < steps.length - 1; i++) {
                // If this edge connects an executed sequence step to the exact next executed sequence step
                if (steps[i].node.id === edge.source && steps[i + 1].node.id === edge.target) {
                    // Additionally, if the edge is a rule branch (Decision node), we check if the path used the exact handle
                    // The backend `useExecutionStepper` doesn't explicitly return the handle used. 
                    // However, we know step[i+1] is the target. If an edge connects them, it's the executed path.
                    // This creates a perfect visual chain for the paths actually taken.
                    isPathActive = true;
                    status = steps[i + 1].status;
                    break;
                }
            }

            if (!isPathActive) {
                // Gray out paths not taken
                return {
                    ...edge,
                    animated: false,
                    style: { ...edge.style, stroke: 'var(--color-border)', strokeDasharray, opacity: 0.3 }
                };
            }

            if (status === 'running') {
                return {
                    ...edge,
                    animated: true,
                    style: { ...edge.style, stroke: 'var(--color-primary)', strokeWidth: 3, strokeDasharray, opacity: 1, filter: 'drop-shadow(0 0 4px var(--color-primary))' }
                };
            } else if (status === 'success') {
                return {
                    ...edge,
                    animated: false,
                    style: { ...edge.style, stroke: 'var(--color-success)', strokeWidth: 3, strokeDasharray, opacity: 1 }
                };
            } else if (status === 'error') {
                return {
                    ...edge,
                    animated: false,
                    style: { ...edge.style, stroke: 'var(--color-error)', strokeWidth: 3, strokeDasharray, opacity: 1 }
                };
            }

            return edge;
        });
    }, [edges, nodes, steps, isExecuting, isSimulationDone]);

    return (
        <div className="skill-designer" ref={reactFlowWrapper}>
            <NodePalette />
            <div className="skill-designer__canvas">

                {/* <pre>{JSON.stringify(edges, null, 2)}</pre> */}
                <ReactFlow
                    nodes={displayNodes}
                    edges={displayEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView={!initialViewport || (initialViewport.x === 0 && initialViewport.y === 0 && initialViewport.zoom === 1)}
                    fitViewOptions={{ padding: 0.2, maxZoom: 1.0, minZoom: 0.8 }}
                    minZoom={0.5}
                    maxZoom={2.0}
                    defaultViewport={initialViewport || { x: 0, y: 0, zoom: 1.0 }}
                    onMoveEnd={(_, viewport) => {
                        if (versionId) {
                            upsertViewportInStorage(versionId, viewport);
                        }
                    }}
                    proOptions={{ hideAttribution: true }}
                    deleteKeyCode={['Backspace', 'Delete']}
                    onNodeClick={(_, node) => {
                        setDrawerNodeId(prev => (prev === node.id ? null : node.id));
                        setDrawerEdgeId(null);
                    }}
                    onNodeDrag={onNodeDrag}
                    onNodeDragStop={onNodeDragStop}
                    onNodeResizeEnd={(_, node) => {
                        // Persist the updated size (width/height) after a subflow group is resized
                        if (versionId && node.type === 'subflow') {
                            const resizedNode = nodes.find(n => n.id === node.id) || node;
                            const persistNode = {
                                ...resizedNode,
                                style: {
                                    ...resizedNode.style,
                                    width: node.width,
                                    height: node.height,
                                },
                            };
                            upsertNodeInStorage(versionId, node.id, persistNode);
                        }
                    }}
                    onEdgeClick={(_, edge) => {
                        setDrawerEdgeId(prev => (prev === edge.id ? null : edge.id));
                        setDrawerNodeId(null);
                    }}
                    onPaneClick={() => {
                        setDrawerNodeId(null);
                        setDrawerEdgeId(null);
                    }}
                    onNodesDelete={(deleted) => {
                        if (deleted.some(node => node.id === drawerNodeId)) {
                            setDrawerNodeId(null);
                        }
                        // Sync deletions to localStorage
                        if (versionId) {
                            deleted.forEach((node) => removeNodeFromStorage(versionId, node.id));
                        }
                    }}
                    onEdgesDelete={(deleted) => {
                        if (deleted.some(edge => edge.id === drawerEdgeId)) {
                            setDrawerEdgeId(null);
                        }
                        // Sync deletions to localStorage
                        if (versionId) {
                            deleted.forEach((edge) => removeConnectionFromStorage(versionId, edge.id));
                        }
                    }}
                >
                    <Background color="var(--text-muted)" variant={BackgroundVariant.Dots} gap={20} size={1.5} />

                    <Controls position="bottom-right" />
                    <MiniMap
                        position="bottom-left"
                        nodeStrokeWidth={3}
                        pannable
                        zoomable
                    />
                </ReactFlow>
                <PropertiesDrawer
                    selectedNodeId={drawerNodeId}
                    selectedEdgeId={drawerEdgeId}
                    onClose={() => {
                        setDrawerNodeId(null);
                        setDrawerEdgeId(null);
                    }}
                />
            </div>
        </div>
    );
}
