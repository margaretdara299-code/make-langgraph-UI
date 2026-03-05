/**
 * Hook to handle drag and drop events from the Node Palette to the React Flow canvas.
 */

import { useCallback } from 'react';
import type { ReactFlowInstance, Node } from '@xyflow/react';
import type { CanvasNodeData } from '@/interfaces';
import { getNextNodeId } from '@/utils';

export default function useCanvasDragDrop(
    reactFlowInstance: ReactFlowInstance | null,
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>
) {
    /** Allow drop on canvas */
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    /** Handle drop from palette */
    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const dataStr = event.dataTransfer.getData('application/reactflow');
            if (!dataStr || !reactFlowInstance) return;

            const data: CanvasNodeData = JSON.parse(dataStr);

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getNextNodeId(),
                type: 'action',
                position,
                data: data as any,
            };

            setNodes((nds) => [...nds, newNode]);
        },
        [reactFlowInstance, setNodes]
    );

    return { onDragOver, onDrop };
}
