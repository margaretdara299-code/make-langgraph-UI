import { useMemo, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    useReactFlow,
} from '@xyflow/react';
import { NODE_TYPES, EDGE_TYPES } from '@/constants';
import { useExecution } from '@/contexts';
import type { DebuggerCanvasInnerProps } from '@/interfaces';
import {
    buildExecutionDebuggerEdges,
    buildExecutionDebuggerNodes,
} from '@/utils';

interface Props extends DebuggerCanvasInnerProps {
    panelWidthToggle?: number;
}

export function DebuggerCanvasInner({ nodes, edges, panelWidthToggle }: Props) {
    const { steps, isExecuting, isSimulationDone, activeStepIndex } = useExecution();
    const { fitView, setCenter, getZoom } = useReactFlow();
    const nodeTypes = useMemo(() => NODE_TYPES, []);
    const edgeTypes = useMemo(() => EDGE_TYPES, []);

    const displayNodes = useMemo(
        () => buildExecutionDebuggerNodes(nodes, steps, isExecuting, isSimulationDone),
        [nodes, steps, isExecuting, isSimulationDone]
    );

    const displayEdges = useMemo(
        () => buildExecutionDebuggerEdges(edges, steps, isExecuting, isSimulationDone),
        [edges, steps, isExecuting, isSimulationDone]
    );

    // Refit smoothly when panels are fully resized or initialized
    useEffect(() => {
        const timeout = setTimeout(() => {
            fitView({ duration: 600, padding: 0.3, maxZoom: 0.85 });
        }, 50);
        return () => clearTimeout(timeout);
    }, [panelWidthToggle, fitView]);

    // Follow the active node during execution
    useEffect(() => {
        if (activeStepIndex >= 0 && activeStepIndex < steps.length) {
            const activeNodeId = steps[activeStepIndex].node.id;
            const activeNode = displayNodes.find(n => n.id === activeNodeId);

            if (activeNode && activeNode.position) {
                const nodeX = activeNode.position.x + 125;
                const nodeY = activeNode.position.y + 40;
                const currentZoom = getZoom();
                setCenter(nodeX, nodeY, { zoom: Math.max(currentZoom, 0.7), duration: 800 });
            }
        }
    }, [activeStepIndex, displayNodes, setCenter, getZoom, steps]);

    return (
        <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={true}
            zoomOnScroll={true}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 0.85 }}
            proOptions={{ hideAttribution: true }}
        >
            <Background color="var(--text-muted)" variant={BackgroundVariant.Dots} gap={20} size={1.5} />
        </ReactFlow>
    );
}
