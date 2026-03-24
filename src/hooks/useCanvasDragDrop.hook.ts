import { useCallback } from 'react';
import type { ReactFlowInstance, Node } from '@xyflow/react';
import type { CanvasNodeData } from '@/interfaces';
import { getNextNodeId } from '@/utils';
import { SUBFLOW_DEFAULT_WIDTH, SUBFLOW_DEFAULT_HEIGHT } from '@/constants';

export default function useCanvasDragDrop(
    reactFlowInstance: ReactFlowInstance | null,
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    nodes: Node[]
) {
    /** Allow drop on canvas */
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    /**
     * Given a flow-space position, find the first sub-flow node whose bounds contain that point.
     */
    const findSubFlowAtPosition = useCallback(
        (x: number, y: number): Node | undefined => {
            // Iterate in reverse so the topmost (last-rendered) sub-flow wins
            for (let i = nodes.length - 1; i >= 0; i--) {
                const n = nodes[i];
                if (n.type !== 'subflow') continue;

                // Respect actual measured/style dimensions first, fallback to defaults
                const w = (n.measured?.width ?? n.style?.width ?? SUBFLOW_DEFAULT_WIDTH) as number;
                const h = (n.measured?.height ?? n.style?.height ?? SUBFLOW_DEFAULT_HEIGHT) as number;

                if (
                    x >= n.position.x &&
                    x <= n.position.x + w &&
                    y >= n.position.y &&
                    y <= n.position.y + h
                ) {
                    return n;
                }
            }
            return undefined;
        },
        [nodes]
    );

    /** Handle drop from palette */
    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const dataStr = event.dataTransfer.getData('application/reactflow');
            if (!dataStr || !reactFlowInstance) return;

            const data = JSON.parse(dataStr);

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // ── Handle Sub-Flow node drop ──
            if (data.nodeType === 'subflow') {
                const newNode: Node = {
                    id: getNextNodeId(),
                    type: 'subflow',
                    position,
                    data: {
                        label: data.label || 'Sub-Flow',
                        description: data.description || '',
                        color: data.color || undefined,
                    },
                    style: {
                        width: SUBFLOW_DEFAULT_WIDTH,
                        height: SUBFLOW_DEFAULT_HEIGHT,
                    },
                };
                setNodes((nds) => [...nds, newNode]);
                return;
            }

            // ── Handle Connector node drop ──
            if (data.nodeType === 'connector') {
                const parentSubFlow = findSubFlowAtPosition(position.x, position.y);
                const newNode: Node = {
                    id: getNextNodeId(),
                    type: 'connector',
                    position: parentSubFlow
                        ? {
                              x: position.x - parentSubFlow.position.x,
                              y: position.y - parentSubFlow.position.y,
                          }
                        : position,
                    data: {
                        label: data.label || 'Connector',
                        category: data.category || 'Connectors',
                        capability: data.capability || 'api',
                        icon: data.icon || 'ApiOutlined',
                        connectorId: data.connectorId,
                        connectorType: data.connectorType,
                        configJson: data.configJson,
                    } as any,
                    ...(parentSubFlow
                        ? {
                              parentId: parentSubFlow.id,
                              extent: 'parent' as const,
                          }
                        : {}),
                };
                setNodes((nds) => [...nds, newNode]);
                return;
            }

            // ── Handle regular action node drop ──
            const nodeData: CanvasNodeData = data;

            let nodeType = 'action';
            const categoryLower = (nodeData.category || '').toLowerCase();
            if (categoryLower === 'triggers') nodeType = 'trigger';
            else if (categoryLower === 'connectors') nodeType = 'connector';
            else if (categoryLower === 'ends') nodeType = 'end';

            // Check whether it landed inside a sub-flow
            const parentSubFlow = findSubFlowAtPosition(position.x, position.y);

            const newNode: Node = {
                id: getNextNodeId(),
                type: nodeType,
                position: parentSubFlow
                    ? {
                          // Make position relative to the sub-flow's top-left
                          x: position.x - parentSubFlow.position.x,
                          y: position.y - parentSubFlow.position.y,
                      }
                    : position,
                data: nodeData as any,
                ...(parentSubFlow
                    ? {
                          parentId: parentSubFlow.id,
                          extent: 'parent' as const,
                      }
                    : {}),
            };

            setNodes((nds) => [...nds, newNode]);
        },
        [reactFlowInstance, setNodes, findSubFlowAtPosition]
    );

    return { onDragOver, onDrop };
}

