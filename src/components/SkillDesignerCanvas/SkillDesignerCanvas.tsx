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
import { getNodeStrokeColor } from '@/utils';
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
            const fromDecision = Boolean(params.sourceHandle) && params.sourceHandle !== 'default' && params.sourceHandle !== 'src' && params.sourceHandle !== 'error';

            // Edges from the action node's `error` handle route to the Error Node.
            // Edges originating from the Error Node route to the End Node.
            // Both should use the dotted red error path styling.
            const isErrorPath = params.sourceHandle === 'error' || sourceNode?.type === 'error';

            setEdges((eds) => addEdge({
                ...params,
                id: edgeId,
                type: 'smoothstep',
                animated: false,
                data: { fromDecision, isErrorPath },
                markerEnd: fromDecision
                    ? undefined
                    : isErrorPath
                        ? { type: MarkerType.ArrowClosed, color: 'var(--color-error)' }
                        : { type: MarkerType.ArrowClosed, color: edgeColor },
                style: isErrorPath
                    ? {
                        stroke: 'var(--color-error)',
                        strokeWidth: 1.5,
                        strokeDasharray: '6 3',
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



    /** Memoize node/edge types to avoid re-renders */
    const nodeTypes = useMemo(() => NODE_TYPES, []);
    const edgeTypes = useMemo(() => EDGE_TYPES, []);

    // ── Live Execution Animation Interception ──
    const { steps, isExecuting, isSimulationDone } = useExecution();

    const displayNodes = useMemo(() => {
        if (!isExecuting && !isSimulationDone) return nodes;

        return nodes.map(node => {
            const step = steps.find(s => s.node.id === node.id);

            // If the node wasn't executed in this simulation, dim it
            if (!step) {
                return {
                    ...node,
                    style: { ...node.style, opacity: 0.25 }
                } as CanvasNode;
            }

            return {
                ...node,
                data: {
                    ...node.data,
                    executionStatus: step.status // Used by Custom Nodes to glow or show badges
                }
            } as CanvasNode;
        });
    }, [nodes, steps, isExecuting, isSimulationDone]);

    const displayEdges = useMemo(() => {
        if (!isExecuting && !isSimulationDone) return edges;

        return edges.map(edge => {
            let isPathActive = false;
            let status = 'idle';

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
                    style: { ...edge.style, stroke: 'var(--color-border)', opacity: 0.3 }
                };
            }

            if (status === 'running') {
                return {
                    ...edge,
                    animated: true,
                    style: { ...edge.style, stroke: 'var(--color-primary)', strokeWidth: 3, opacity: 1, filter: 'drop-shadow(0 0 4px var(--color-primary))' }
                };
            } else if (status === 'success') {
                return {
                    ...edge,
                    animated: false,
                    style: { ...edge.style, stroke: 'var(--color-success)', strokeWidth: 3, opacity: 1 }
                };
            } else if (status === 'error') {
                return {
                    ...edge,
                    animated: false,
                    style: { ...edge.style, stroke: 'var(--color-error)', strokeWidth: 3, opacity: 1 }
                };
            }

            return edge;
        });
    }, [edges, steps, isExecuting, isSimulationDone]);

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
                    onNodeDragStop={(_, node) => {
                        if (versionId) {
                            // Find the latest state of this node (including data) to upsert
                            const latestNode = nodes.find(n => n.id === node.id) || node;
                            upsertNodeInStorage(versionId, node.id, latestNode);
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
