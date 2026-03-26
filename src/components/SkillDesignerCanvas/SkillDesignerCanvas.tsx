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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodePalette from '@/components/NodePalette/NodePalette';
import PropertiesDrawer from '@/components/PropertiesDrawer/PropertiesDrawer';
import { NODE_TYPES, EDGE_TYPES } from '@/constants';
import { useCanvasDragDrop, useSkillGraph } from '@/hooks';
import {
    upsertNodeInStorage,
    upsertConnectionInStorage,
    removeNodeFromStorage,
    removeConnectionFromStorage,
} from '@/services/skillGraphStorage.service';
import './SkillDesignerCanvas.css';

export default function SkillDesignerCanvas() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { initialNodes, initialEdges, versionId } = useSkillGraph();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    // Sync nodes/edges when loaded asynchronously
    useEffect(() => {
        if (initialNodes && initialNodes.length > 0) {
            setNodes(initialNodes);
        }
        if (initialEdges && initialEdges.length > 0) {
            setEdges(initialEdges);
        }
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    // Track which node or edge is actively opened in the properties drawer
    const [drawerNodeId, setDrawerNodeId] = useState<string | null>(null);
    const [drawerEdgeId, setDrawerEdgeId] = useState<string | null>(null);

    // Call our extracted drag & drop hook
    const { onDragOver, onDrop } = useCanvasDragDrop(reactFlowInstance, setNodes, nodes);

    /** Connect two nodes */
    const onConnect: OnConnect = useCallback(
        (params) => {
            const edgeId = `xy-edge__${params.source}-${params.target}`;
            setEdges((eds) => addEdge({
                ...params,
                id: edgeId,
                animated: true,
            }, eds));

            // Sync to localStorage
            if (versionId) {
                upsertConnectionInStorage(versionId, edgeId, {
                    id: edgeId,
                    source: params.source,
                    target: params.target,
                });
            }
        },
        [setEdges, versionId]
    );

    /** Memoize node/edge types to avoid re-renders */
    const nodeTypes = useMemo(() => NODE_TYPES, []);
    const edgeTypes = useMemo(() => EDGE_TYPES, []);

    return (
        <div className="skill-designer" ref={reactFlowWrapper}>
            <NodePalette />
            <div className="skill-designer__canvas">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    fitViewOptions={{ maxZoom: 1 }}
                    deleteKeyCode={['Backspace', 'Delete']}
                    onNodeClick={(_, node) => {
                        setDrawerNodeId(node.id);
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
                        setDrawerEdgeId(edge.id);
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
                    <Background color="var(--color-border)" gap={20} size={1} />
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
