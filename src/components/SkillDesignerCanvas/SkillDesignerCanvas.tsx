/**
 * SkillDesignerCanvas — The core React Flow canvas area.
 * Extracted from the page wrapper to maintain separate component responsibilities.
 */

import { useCallback, useRef, useState, useMemo } from 'react';
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
import { NODE_TYPES } from '@/constants';
import { useCanvasDragDrop } from '@/hooks';
import './SkillDesignerCanvas.css';

export default function SkillDesignerCanvas() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    // Call our extracted drag & drop hook
    const { onDragOver, onDrop } = useCanvasDragDrop(reactFlowInstance, setNodes);

    /** Connect two nodes */
    const onConnect: OnConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
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
                >
                    <Background color="var(--color-border)" gap={20} size={1} />
                    <Controls />
                    <MiniMap
                        nodeStrokeWidth={3}
                        pannable
                        zoomable
                    />
                </ReactFlow>
            </div>
        </div>
    );
}
