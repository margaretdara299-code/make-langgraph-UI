import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { ReactFlowInstance, Node } from '@xyflow/react';
import type { CanvasNodeData } from '@/interfaces';
import { getNextNodeId } from '@/utils';
import { SUBFLOW_DEFAULT_WIDTH, SUBFLOW_DEFAULT_HEIGHT } from '@/constants';
import { fetchActionById } from '@/services';
import { upsertNodeInStorage } from '@/services/skillGraphStorage.service';
import { useCapabilities } from '@/hooks';

export default function useCanvasDragDrop(
    reactFlowInstance: ReactFlowInstance | null,
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    nodes: Node[]
) {
    const { versionId } = useParams<{ versionId: string }>();
    const { capabilities } = useCapabilities();

    const capabilitiesMap: Record<number, string> = Object.fromEntries(
        capabilities.map((capability: any) => [capability.capabilityId ?? capability.capability_id, (capability.name || '').toLowerCase()])
    );

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
                if (versionId) upsertNodeInStorage(versionId, newNode.id, newNode);
                return;
            }

            // ── Handle Start node drop ──
            if (data.nodeType === 'start') {
                const newNode: Node = {
                    id: getNextNodeId(),
                    type: 'start',
                    position,
                    data: {
                        label: data.label || 'Start',
                        category: data.category || 'structure',
                        icon: data.icon || 'Play',
                    } as any,
                };
                setNodes((nds) => [...nds, newNode]);
                if (versionId) upsertNodeInStorage(versionId, newNode.id, newNode);
                return;
            }

            // ── Handle End node drop ──
            if (data.nodeType === 'end') {
                const newNode: Node = {
                    id: getNextNodeId(),
                    type: 'end',
                    position,
                    data: {
                        label: data.label || 'End',
                        category: data.category || 'structure',
                        icon: data.icon || 'Square',
                        response_format: 'auto',
                        fail_response_format: 'json',
                        fail_status_code: 500,
                        fail_message: '',
                    } as any,
                };
                setNodes((nds) => [...nds, newNode]);
                if (versionId) upsertNodeInStorage(versionId, newNode.id, newNode);
                return;
            }

            // ── Handle Decision node drop ──
            if (data.nodeType === 'decision') {
                const newNode: Node = {
                    id: getNextNodeId(),
                    type: 'decision',
                    position,
                    data: {
                        label:          data.label || 'Decision',
                        category:       'structure',
                        icon:           'Zap',
                        rules:          []
                    } as any,
                };
                setNodes((nds) => [...nds, newNode]);
                if (versionId) upsertNodeInStorage(versionId, newNode.id, newNode);
                return;
            }

            // ── Handle Error node drop ──
            if (data.nodeType === 'error') {
                const newNode: Node = {
                    id: getNextNodeId(),
                    type: 'error',
                    position,
                    data: {
                        label: data.label || 'Error Handler',
                        category: 'structure',
                        icon: 'ShieldAlert',
                        configurations: {
                            error_api_url:    '',
                            error_api_method: 'POST',
                        },
                    } as any,
                };
                setNodes((nds) => [...nds, newNode]);
                if (versionId) upsertNodeInStorage(versionId, newNode.id, newNode);
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
                        connector_id: data.connector_id || data.connectorId,
                        connector_type: data.connector_type || data.connectorType,
                        config_json: data.config_json || data.configJson,
                    } as any,
                    ...(parentSubFlow
                        ? {
                            parentId: parentSubFlow.id,
                            extent: 'parent' as const,
                        }
                        : {}),
                };
                setNodes((nds) => [...nds, newNode]);
                if (versionId) upsertNodeInStorage(versionId, newNode.id, newNode);
                return;
            }

            // ── Handle regular action node drop ──
            const nodeData: CanvasNodeData = data;
            const nodeId = getNextNodeId();

            let nodeType = 'action';
            const categoryLower = (nodeData.category || '').toLowerCase();
            if (categoryLower === 'triggers') nodeType = 'trigger';
            else if (categoryLower === 'connectors') nodeType = 'connector';
            else if (categoryLower === 'ends') nodeType = 'end';

            // Check whether it landed inside a sub-flow
            const parentSubFlow = findSubFlowAtPosition(position.x, position.y);

            // Create a placeholder node immediately so the user sees it on the canvas
            const placeholderNode: Node = {
                id: nodeId,
                type: nodeType,
                position: parentSubFlow
                    ? {
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

            setNodes((nds) => [...nds, placeholderNode]);

            // Fetch full action data from backend to enrich the node
            const actionId = nodeData.action_id || (nodeData as any).actionId;
            if (actionId) {
                // Fetch both action details and capabilities map to guarantee capability name resolution
                import('@/services').then(({ fetchCapabilities }) => {
                    Promise.all([
                        fetchActionById(actionId),
                        fetchCapabilities()
                    ]).then(([result, capResult]) => {
                        if (result.success && result.data) {
                            const rawAction = result.data as any;

                            // Build fresh capability map
                            const freshCapabilities = capResult || [];
                            const freshMap: Record<number, string> = Object.fromEntries(
                                freshCapabilities.map((c: any) => [c.capabilityId ?? c.capability_id, (c.name || '').toLowerCase()])
                            );

                            // Map capabilities by ID to ensure things like "ai" and "agent" show correctly
                            const resolvedId = rawAction.capability_id || rawAction.capabilityId;

                            // Map lookup by backend ID takes absolute strict precedence over frontend string guesses
                            const mappedCapability = (
                                (resolvedId && freshMap[resolvedId]) ||
                                (resolvedId && capabilitiesMap[resolvedId]) ||
                                rawAction.capability ||
                                nodeData.capability ||
                                'api'
                            ).toLowerCase();

                            const enrichedData = {
                                ...rawAction, // Keep every payload key the API returned!
                                action_id: rawAction.action_definition_id || rawAction.action_id || actionId,
                                action_key: rawAction.action_key || nodeData.action_key,
                                action_version_id: rawAction.action_version_id || '',
                                label: nodeData.label || rawAction.name,
                                category: nodeData.category || rawAction.category || 'Uncategorized',
                                capability: mappedCapability,
                                icon: nodeData.icon || rawAction.icon || 'Package',
                                configurations_json: rawAction.configurations_json || {},
                                category_id: rawAction.category_id,
                            };

                            // Build the full node object matching the Save payload format
                            const fullNode: Node = {
                                ...placeholderNode,
                                data: enrichedData as any,
                            };

                            // Update React Flow
                            setNodes((nds) =>
                                nds.map((n) => (n.id === nodeId ? fullNode : n))
                            );

                            // Persist to localStorage
                            if (versionId) upsertNodeInStorage(versionId, nodeId, fullNode);
                        } else {
                            // API fetch failed — persist placeholder as-is
                            if (versionId) upsertNodeInStorage(versionId, nodeId, placeholderNode);
                        }
                    }).catch(() => {
                        // Persist placeholder on error
                        if (versionId) upsertNodeInStorage(versionId, nodeId, placeholderNode);
                    });
                });
            } else {
                // No actionId — just persist placeholder
                if (versionId) upsertNodeInStorage(versionId, nodeId, placeholderNode);
            }
        },
        [reactFlowInstance, setNodes, findSubFlowAtPosition, versionId, capabilitiesMap]
    );

    return { onDragOver, onDrop };
}
