/**
 * useSkillGraph hook
 * Loads graph from backend API (always the source of truth on load),
 * seeds localStorage, and provides a save function that reads from localStorage.
 */

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { type Node, type Edge } from '@xyflow/react';
import { loadSkillGraph, saveSkillGraph } from '@/services/graph.service';
import {
    loadGraphFromStorage,
    saveGraphToStorage,
} from '@/services/skillGraphStorage.service';
import { message } from 'antd';

export function useSkillGraph() {
    const { versionId } = useParams<{ versionId: string }>();
    const [initialNodes, setInitialNodes] = useState<Node[]>([]);
    const [initialEdges, setInitialEdges] = useState<Edge[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load graph from backend on mount — always replaces localStorage
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
                    return node;
                });

                // Build React Flow edges from connections + store connections as-is
                const connectionsMap: Record<string, any> = {};
                const reactFlowEdges: Edge[] = Object.entries(connectionsObj).map(([key, conn]: [string, any]) => {
                    const edgeId = conn.id || key;
                    connectionsMap[edgeId] = {
                        id: edgeId,
                        source: conn.source,
                        target: conn.target,
                    };
                    return {
                        id: edgeId,
                        source: conn.source,
                        target: conn.target,
                        type: 'default',
                        animated: true,
                    };
                });

                // Seed localStorage (replaces any stale data)
                saveGraphToStorage(versionId, nodesMap, connectionsMap);

                setInitialNodes(reactFlowNodes);
                setInitialEdges(reactFlowEdges);
            })
            .catch((err) => {
                console.error('Failed to load skill graph:', err);
                message.error('Failed to load skill graph');
            })
            .finally(() => setIsLoading(false));
    }, [versionId]);

    // Save current state to backend — reads from localStorage
    const saveGraph = useCallback(async () => {
        if (!versionId) return { success: false, error: 'No version ID' };

        const stored = loadGraphFromStorage(versionId);
        if (!stored) return { success: false, error: 'No graph data in localStorage' };

        // Convert nodes map to array, strip internal-only fields
        const cleanNodes = Object.values(stored.nodes).map((node: any) => {
            const { inputsSchemaJson, outputsSchemaJson, executionJson, ...cleanData } = node.data || {};
            return { ...node, data: cleanData };
        });

        return saveSkillGraph(versionId, cleanNodes, stored.connections);
    }, [versionId]);

    return {
        initialNodes,
        initialEdges,
        saveGraph,
        isLoading,
        versionId: versionId || '',
    };
}
