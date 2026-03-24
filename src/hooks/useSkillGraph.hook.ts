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
                setInitialNodes(data.nodes || []);
                setInitialEdges(data.edges || []); 
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
        
        // Convert edges to connections format if backend expects it
        const connections: Record<string, any> = {};
        edges.forEach(edge => {
            connections[edge.id] = {
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
                data: edge.data
            };
        });

        return saveSkillGraph(versionId, nodes, connections);
    }, [versionId]);

    return {
        initialNodes,
        initialEdges,
        saveGraph,
        isLoading
    };
}
