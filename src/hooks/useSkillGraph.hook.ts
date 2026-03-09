/**
 * useSkillGraph hook
 * Loads initial state from localStorage or falls back to MOCK_INITIAL_GRAPH.
 * Provides a save function to commit current React Flow state to localStorage.
 */

import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { type Node, type Edge } from '@xyflow/react';
import { MOCK_INITIAL_NODES, MOCK_INITIAL_EDGES } from '@/services/mock-data/graph.mock';

export function useSkillGraph() {
    const { skillId } = useParams<{ skillId: string }>();
    const storageKey = `tensaw_skill_graph_${skillId || 'unknown'}`;
    // Attempt to load from localStorage first
    const loadInitialState = useCallback(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    initialNodes: parsed.nodes || MOCK_INITIAL_NODES,
                    initialEdges: parsed.edges || MOCK_INITIAL_EDGES
                };
            }
        } catch (e) {
            console.error('Failed to parse graph from local storage', e);
        }

        // Fallback to mock data
        return {
            initialNodes: MOCK_INITIAL_NODES,
            initialEdges: MOCK_INITIAL_EDGES
        };
    }, []);

    const [initialGraph] = useState(loadInitialState);

    // Save current state to localStorage
    const saveGraph = useCallback((nodes: Node[], edges: Edge[]) => {
        const graphData = { nodes, edges };
        localStorage.setItem(storageKey, JSON.stringify(graphData));
        return Promise.resolve(true); // Return promise to allow UI to await (e.g., for showing a toast)
    }, [storageKey]);

    return {
        initialNodes: initialGraph.initialNodes,
        initialEdges: initialGraph.initialEdges,
        saveGraph
    };
}
