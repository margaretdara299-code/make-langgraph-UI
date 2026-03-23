/**
 * useSkillGraph hook
 * Loads initial state from localStorage or falls back to MOCK_INITIAL_GRAPH.
 * Provides a save function to commit current React Flow state to localStorage.
 */

import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { type Node, type Edge } from '@xyflow/react';
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
                    initialNodes: parsed.nodes || [],
                    initialEdges: parsed.edges || []
                };
            }
        } catch (e) {
            console.error('Failed to parse graph from local storage', e);
        }

        // Fallback to empty state
        return {
            initialNodes: [],
            initialEdges: []
        };
    }, [storageKey]);

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
