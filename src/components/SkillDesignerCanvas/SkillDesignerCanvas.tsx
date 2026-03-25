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
import { NODE_TYPES } from '@/constants';
import { useCanvasDragDrop, useSkillGraph } from '@/hooks';
import './SkillDesignerCanvas.css';

export default function SkillDesignerCanvas() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { initialNodes, initialEdges } = useSkillGraph();
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
        (params) => setEdges((eds) => addEdge({
            ...params,
            animated: true,
            data: { routeType: 'unconditional' },
        }, eds)),
        [setEdges]
    );

    /** Memoize node types to avoid re-renders */
    const nodeTypes = useMemo(() => NODE_TYPES, []);

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
                    fitView
                    deleteKeyCode={['Backspace', 'Delete']}
                    onNodeClick={(_, node) => {
                        setDrawerNodeId(node.id);
                        setDrawerEdgeId(null);
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
                    }}
                    onEdgesDelete={(deleted) => {
                        if (deleted.some(edge => edge.id === drawerEdgeId)) {
                            setDrawerEdgeId(null);
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
