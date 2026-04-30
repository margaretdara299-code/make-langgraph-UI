/**
 * useSkillGraph hook
 * Loads graph from backend API (always the source of truth on load),
 * seeds localStorage, and provides a save function that reads from localStorage.
 */

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { type Node, type Edge, MarkerType } from '@xyflow/react';
import { loadSkillGraph, saveSkillGraph } from '@/services/graph.service';
import { getNodeStrokeColor } from '@/utils';
import {
    loadGraphFromStorage,
    saveGraphToStorage,
} from '@/services/skillGraphStorage.service';
import { message } from 'antd';

export function useSkillGraph() {
    const { versionId } = useParams<{ versionId: string }>();
    const [initialNodes, setInitialNodes] = useState<Node[]>([]);
    const [initialEdges, setInitialEdges] = useState<Edge[]>([]);
    const [initialViewport, setInitialViewport] = useState<{ x: number, y: number, zoom: number }>({ x: 0, y: 0, zoom: 1 });
    const [isLoading, setIsLoading] = useState(false);

    // Load graph from backend on mount; always replaces localStorage
    useEffect(() => {
        if (!versionId) return;
        setIsLoading(true);
        loadSkillGraph(versionId)
            .then((data: any) => {
                const apiNodes: any[] = data.nodes || [];
                const connectionsObj: Record<string, any> = data.connections || {};

                // Build the localStorage-compatible node map (keyed by nodeId)
                const nodesMap: Record<string, any> = {};
                const reactFlowNodes: Node[] = apiNodes.map((node: any) => {
                    nodesMap[node.id] = node;

                    // Preserve parentId and extent for sub-flow children
                    const rfNode: any = { ...node };
                    if (node.parentId || node.parentNode) {
                        rfNode.parentId = node.parentId || node.parentNode;
                        rfNode.extent = node.extent || 'parent';
                    }
                    return rfNode as Node;
                });

                // Sort: parent (subflow) nodes must come before their children
                reactFlowNodes.sort((a, b) => {
                    const aIsParent = a.type === 'subflow';
                    const bIsParent = b.type === 'subflow';
                    if (aIsParent && !bIsParent) return -1;
                    if (!aIsParent && bIsParent) return 1;
                    return 0;
                });

                // Build React Flow edges from connections + store connections as-is
                const connectionsMap: Record<string, any> = {};
                const reactFlowEdges: Edge[] = Object.entries(connectionsObj).map(([key, conn]: [string, any]) => {
                    const edgeId = conn.id || key;
                    const sourceNode = reactFlowNodes.find((node) => node.id === conn.source);
                    const targetNode = reactFlowNodes.find((node) => node.id === conn.target);
                    const edgeColor = getNodeStrokeColor(sourceNode);

                    // We must map sourceHandle/targetHandle into our storage payload
                    // so the next Save doesn't erase them (posting null to backend).
                    connectionsMap[edgeId] = {
                        id: edgeId,
                        source: conn.source,
                        target: conn.target,
                        sourceHandle: conn.sourceHandle,
                        targetHandle: conn.targetHandle,
                    };

                    // Parallel split branches carry a sourceHandle (branch ID) —
                    // must be excluded from decision-edge detection.
                    const isFromSplitNode = sourceNode?.type === 'parallel_split';
                    const isParallelBranch = isFromSplitNode && Boolean(conn.sourceHandle);

                    // A decision-branch edge originates from a named rule handle.
                    // Must explicitly exclude "default", "error", and split branches.
                    const fromDecision = !isFromSplitNode
                        && Boolean(conn.sourceHandle)
                        && conn.sourceHandle !== 'default'
                        && conn.sourceHandle !== 'error';

                    const isErrorPath = conn.sourceHandle === 'error'
                        || targetNode?.type === 'error'
                        || sourceNode?.type === 'error';

                    const parallelBranchColor = 'var(--color-node-split, #ec4899)';

                    return {
                        id: edgeId,
                        source: conn.source,
                        sourceHandle: conn.sourceHandle,
                        target: conn.target,
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
                });

                // Ensure at least one Start and one End node exist on load
                const hasStart = reactFlowNodes.some((node: Node) => node.type === 'start');
                const hasEnd = reactFlowNodes.some((node: Node) => node.type === 'end');

                if (!hasStart) {
                    const startNodeId = 'start-node-auto';
                    const startNode: Node = {
                        id: startNodeId,
                        type: 'start',
                        position: { x: 240, y: 120 },
                        data: {
                            label: 'Start',
                            category: 'structure',
                            icon: 'play',
                        } as any,
                    };
                    reactFlowNodes.push(startNode);
                    nodesMap[startNodeId] = startNode;
                }

                if (!hasEnd) {
                    const endNodeId = 'end-node-auto';
                    // We attempt to place it further down so it doesn't overlap immediately
                    const maxY = reactFlowNodes.length > 0
                        ? Math.max(...reactFlowNodes.map((node: Node) => node.position.y)) + 200
                        : 600;

                    const endNode: Node = {
                        id: endNodeId,
                        type: 'end',
                        position: { x: 240, y: maxY },
                        data: {
                            label: 'End',
                            category: 'termination',
                            icon: 'flag',
                        } as any,
                    };
                    reactFlowNodes.push(endNode);
                    nodesMap[endNodeId] = endNode;
                }

                // Seed localStorage (replaces any stale data)
                const viewportObj = data.viewport_json || { x: 0, y: 0, zoom: 1 };
                saveGraphToStorage(versionId, nodesMap, connectionsMap, viewportObj);

                setInitialViewport(viewportObj);
                setInitialNodes(reactFlowNodes);
                setInitialEdges(reactFlowEdges);
            })
            .catch((err) => {
                console.error('Failed to load skill graph:', err);
                message.error('Failed to load skill graph');
            })
            .finally(() => setIsLoading(false));
    }, [versionId]);

    // Save current state to backend; reads from localStorage
    const saveGraph = useCallback(async () => {
        if (!versionId) return { success: false, error: 'No version ID' };

        const stored = loadGraphFromStorage(versionId);
        if (!stored) return { success: false, error: 'No graph data in localStorage' };

        // Convert nodes map to array, strip internal-only fields
        const cleanNodes = Object.values(stored.nodes).map((node: any) => {
            // Strip React Flow internal runtime fields that must never be persisted:
            //   measured  — RF sets this after DOM layout; conflicts with style.width/height on reload
            //   selected / dragging / resizing — transient interaction state
            const { measured: _m, selected: _s, dragging: _d, resizing: _r, ...nodeRest } = node;

            const {
                inputsSchemaJson, inputs_schema_json,
                outputsSchemaJson, outputs_schema_json,
                executionJson, execution_json,
                ...cleanData
            } = node.data || {};
            return { ...nodeRest, data: cleanData };
        });

        const viewportToSave = stored.viewport || { x: 0, y: 0, zoom: 1 };

        return saveSkillGraph(versionId, cleanNodes, stored.connections, viewportToSave);
    }, [versionId]);

    return {
        initialNodes,
        initialEdges,
        initialViewport,
        saveGraph,
        isLoading,
        versionId: versionId || '',
    };
}
