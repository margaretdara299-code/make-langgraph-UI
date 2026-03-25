/**
 * useSkillGraph hook
 * Loads initial state from localStorage or falls back to MOCK_INITIAL_GRAPH.
 * Provides a save function to commit current React Flow state to localStorage.
 */

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { type Node, type Edge } from '@xyflow/react';
import { loadSkillGraph, saveSkillGraph } from '@/services/graph.service';
import { message } from 'antd';

export function useSkillGraph() {
    const { versionId } = useParams<{ versionId: string }>();
    const [initialNodes, setInitialNodes] = useState<Node[]>([]);
    const [initialEdges, setInitialEdges] = useState<Edge[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load graph from backend on mount
    useEffect(() => {
        if (!versionId) return;
        setIsLoading(true);
        loadSkillGraph(versionId)
            .then((data: any) => {
                // Nodes come ready from the backend
                setInitialNodes(data.nodes || []);

                // Connections come as a keyed object — transform to React Flow edge array
                const connectionsObj = data.connections || {};
                const edges: Edge[] = Object.entries(connectionsObj).map(([key, conn]: [string, any]) => ({
                    id: conn.id || key,
                    source: conn.source,
                    target: conn.target,
                    type: 'default',
                }));
                setInitialEdges(edges);
            })
            .catch((err) => {
                console.error('Failed to load skill graph:', err);
                message.error('Failed to load skill graph');
            })
            .finally(() => setIsLoading(false));
    }, [versionId]);

    // Save current state to backend
    const saveGraph = useCallback(async (nodes: Node[], edges: Edge[]) => {
        if (!versionId) return { success: false, error: 'No version ID' };

        // Strip internal-only fields from node data before sending to backend
        const cleanNodes = nodes.map(node => {
            const { inputsSchemaJson, outputsSchemaJson, executionJson, ...cleanData } = (node.data as any) || {};
            return { ...node, data: cleanData };
        });

        // Convert edges to simplified connections format
        const connections: Record<string, any> = {};
        edges.forEach(edge => {
            connections[edge.id] = {
                id: edge.id,
                source: edge.source,
                target: edge.target,
            };
        });

        return saveSkillGraph(versionId, cleanNodes, connections);
    }, [versionId]);

    return {
        initialNodes,
        initialEdges,
        saveGraph,
        isLoading
    };
}
