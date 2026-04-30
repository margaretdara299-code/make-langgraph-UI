import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MarkerType } from '@xyflow/react';
import type { ReactFlowInstance, Node, Edge } from '@xyflow/react';
import type { CanvasNodeData } from '@/interfaces';
import { getNextNodeId, getNodeStrokeColor } from '@/utils';
import { SUBFLOW_DEFAULT_WIDTH, SUBFLOW_DEFAULT_HEIGHT } from '@/constants';
import { fetchActionById } from '@/services';
import { loadSkillGraph } from '@/services/graph.service';
import { fetchSkillById } from '@/services/skill.service';
import { upsertNodeInStorage, upsertConnectionInStorage } from '@/services/skillGraphStorage.service';
import { useCapabilities } from '@/hooks';

export default function useCanvasDragDrop(
    reactFlowInstance: ReactFlowInstance | null,
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    nodes: Node[],
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
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

            // ── Handle Skill drop — wrapped group expansion ──
            if (data.nodeType === 'skill') {
                const skillId = data.actionId;
                let versionIdToLoad: string | undefined = data.latestVersionId;

                const GROUP_PADDING = 48;
                const NODE_EST_W = 220;
                const NODE_EST_H = 80;
                const GROUP_HEADER_H = 40;

                const expandSkill = async () => {
                    // Fall back to fetching the skill if we don't have the version ID
                    if (!versionIdToLoad && skillId) {
                        const skillResult = await fetchSkillById(skillId);
                        if (skillResult.success && skillResult.data) {
                            versionIdToLoad = skillResult.data.latestVersionId;
                        }
                    }

                    if (!versionIdToLoad) {
                        console.warn('Cannot expand skill: no latestVersionId available', skillId);
                        return;
                    }

                    const graph = await loadSkillGraph(versionIdToLoad);
                    const importedNodes: any[] = graph.nodes || [];
                    const importedConnections: Record<string, any> = graph.connections || {};

                    if (importedNodes.length === 0) return;

                    // Bounding box of the source skill's node positions
                    const minX = Math.min(...importedNodes.map((n: any) => n.position?.x ?? 0));
                    const minY = Math.min(...importedNodes.map((n: any) => n.position?.y ?? 0));
                    const maxX = Math.max(...importedNodes.map((n: any) => (n.position?.x ?? 0) + (n.style?.width ?? NODE_EST_W)));
                    const maxY = Math.max(...importedNodes.map((n: any) => (n.position?.y ?? 0) + (n.style?.height ?? NODE_EST_H)));

                    const contentW = maxX - minX;
                    const contentH = maxY - minY;
                    const groupW = Math.max(contentW + GROUP_PADDING * 2, SUBFLOW_DEFAULT_WIDTH);
                    const groupH = Math.max(contentH + GROUP_PADDING * 2 + GROUP_HEADER_H, SUBFLOW_DEFAULT_HEIGHT);

                    // Group node — centered at drop position, must be added before children
                    const groupId = getNextNodeId();
                    const groupNode: Node = {
                        id: groupId,
                        type: 'subflow',
                        position: {
                            x: position.x - groupW / 2,
                            y: position.y - groupH / 2,
                        },
                        data: {
                            label: data.label || 'Skill Group',
                            description: data.description || '',
                        },
                        style: { width: groupW, height: groupH },
                    };
                    if (versionId) upsertNodeInStorage(versionId, groupId, groupNode);

                    // Remap old node IDs → fresh unique IDs
                    const idMap: Record<string, string> = {};
                    importedNodes.forEach((n: any) => { idMap[n.id] = getNextNodeId(); });

                    // Build children with positions relative to the group
                    const newNodes: Node[] = importedNodes.map((n: any) => {
                        const newId = idMap[n.id];
                        const newNode: Node = {
                            ...n,
                            id: newId,
                            position: {
                                x: (n.position?.x ?? 0) - minX + GROUP_PADDING,
                                y: (n.position?.y ?? 0) - minY + GROUP_PADDING + GROUP_HEADER_H,
                            },
                            parentId: groupId,
                            extent: 'parent' as const,
                        };
                        if (versionId) upsertNodeInStorage(versionId, newId, newNode);
                        return newNode;
                    });

                    // Build internal edges with remapped IDs and correct styling
                    const newEdges: Edge[] = Object.values(importedConnections).map((conn: any) => {
                        const newSource = idMap[conn.source];
                        const newTarget = idMap[conn.target];
                        if (!newSource || !newTarget) return null;

                        const sourceNode = newNodes.find(n => n.id === newSource);
                        const targetNode = newNodes.find(n => n.id === newTarget);
                        const edgeColor = getNodeStrokeColor(sourceNode);

                        const isFromSplitNode = sourceNode?.type === 'parallel_split';
                        const isParallelBranch = isFromSplitNode && Boolean(conn.sourceHandle);
                        const fromDecision = !isFromSplitNode
                            && Boolean(conn.sourceHandle)
                            && conn.sourceHandle !== 'default'
                            && conn.sourceHandle !== 'error';
                        const isErrorPath = conn.sourceHandle === 'error'
                            || targetNode?.type === 'error'
                            || sourceNode?.type === 'error';

                        const parallelBranchColor = 'var(--color-node-split, #ec4899)';

                        const edgeId = [
                            'edge', newSource, conn.sourceHandle ?? 'src',
                            newTarget, conn.targetHandle ?? 'tgt', Date.now(),
                        ].join('__');

                        const newEdge: Edge = {
                            id: edgeId,
                            source: newSource,
                            sourceHandle: conn.sourceHandle,
                            target: newTarget,
                            targetHandle: conn.targetHandle,
                            type: 'smoothstep',
                            animated: false,
                            data: { fromDecision, isErrorPath, isParallelBranch, branchId: conn.sourceHandle },
                            markerEnd: fromDecision
                                ? undefined
                                : isErrorPath
                                    ? { type: MarkerType.ArrowClosed, color: 'var(--color-error)' }
                                    : isParallelBranch
                                        ? { type: MarkerType.ArrowClosed, color: parallelBranchColor }
                                        : { type: MarkerType.ArrowClosed, color: edgeColor },
                            style: isErrorPath
                                ? { stroke: 'var(--color-error)', strokeWidth: 1.5, strokeDasharray: '6 3' }
                                : isParallelBranch
                                    ? { stroke: parallelBranchColor, strokeWidth: 1.5, strokeDasharray: '4 3' }
                                    : { stroke: edgeColor, strokeWidth: fromDecision ? 2 : 1.5 },
                        };

                        if (versionId) {
                            upsertConnectionInStorage(versionId, edgeId, {
                                id: edgeId,
                                source: newSource,
                                sourceHandle: conn.sourceHandle,
                                target: newTarget,
                                targetHandle: conn.targetHandle,
                            });
                        }

                        return newEdge;
                    }).filter(Boolean) as Edge[];

                    // Group node must appear before its children in the array
                    setNodes((nds) => [...nds, groupNode, ...newNodes]);
                    setEdges((eds) => [...eds, ...newEdges]);
                };

                expandSkill().catch(err => console.error('Failed to expand skill:', err));
                return;
            }

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

            // ── Handle Queue node drop ──
            if (data.nodeType === 'queue') {
                const newNode: Node = {
                    id: getNextNodeId(),
                    type: 'queue',
                    position,
                    data: {
                        label:       data.label || 'Queue',
                        category:    'structure',
                        icon:        'Layers',
                        queue_name:  '',
                        configurations_json: {
                            method: 'POST',
                            url: '',
                            path_params: [],
                            query_params: [],
                            header_params: [],
                            inherit_previous_response: true,
                            body_params_type: 'form-data',
                            body_params: [],
                            response_to_state_mapping: [],
                        },
                    } as any,
                };
                setNodes((nds) => [...nds, newNode]);
                if (versionId) upsertNodeInStorage(versionId, newNode.id, newNode);
                return;
            }

            // ── Handle Parallel Split drop ──
            if (data.nodeType === 'parallel_split') {
                const newNode: Node = {
                    id: getNextNodeId(),
                    type: 'parallel_split',
                    position,
                    data: {
                        label:                   data.label || 'Split',
                        description:             '',
                        category:                'structure',
                        icon:                    data.icon || 'GitFork',
                        node_kind:               'split',
                        split_mode:              'parallel_all',
                        source_scope:            'state',
                        source_node_id:          '',
                        source_output_key:       '',
                        source_path:             '',
                        branches:                [],   // ← empty: no handles shown initially
                        timeout_seconds:         60,
                        on_required_error:       'route_to_error',
                        on_optional_error:       'continue_with_error',
                        output_key:              'parallel_results',
                        error_output_key:        'parallel_errors',
                        include_branch_metadata: true,
                    } as any,
                };
                setNodes((nds) => [...nds, newNode]);
                if (versionId) upsertNodeInStorage(versionId, newNode.id, newNode);
                return;
            }

            // ── Handle Parallel Join drop ──
            if (data.nodeType === 'parallel_join') {
                const newNode: Node = {
                    id: getNextNodeId(),
                    type: 'parallel_join',
                    position,
                    data: {
                        label:           data.label || 'Merge',
                        description:     '',
                        category:        'structure',
                        icon:            data.icon || 'GitMerge',
                        node_kind:       'merge',
                        merge_strategy:  'wait_selected',
                        expected_source: 'connected_branches',
                        timeout_seconds: null,
                        output_key:      'merged_parallel_results',
                        output_format:   'object_by_branch',
                        on_branch_error: 'fail_merge',
                        include_errors:  true,
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
                    // Dynamic extent: set 'parent' only if dropped inside a subflow.
                    // SkillDesignerCanvas's onNodeDragStop will clear extent when the
                    // user later drags this node outside the group (detach behavior).
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
                // Dynamic extent: set 'parent' only if dropped inside a subflow.
                // SkillDesignerCanvas's onNodeDragStop will clear extent when the
                // user later drags this node outside the group (detach behavior).
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
        [reactFlowInstance, setNodes, setEdges, findSubFlowAtPosition, versionId, capabilitiesMap]
    );

    return { onDragOver, onDrop };
}
