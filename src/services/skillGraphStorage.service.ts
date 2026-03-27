/**
 * skillGraphStorage.service.ts
 * 
 * Thin localStorage wrapper for persisting skill graph state (nodes + connections)
 * on a per-skill-version basis. Used for in-session edit persistence until the
 * user clicks Save (which pushes to the backend API).
 */

// ── Key Helpers ──

function getStorageKey(versionId: string): string {
    return `skill_graph_${versionId}`;
}

interface StoredGraph {
    nodes: Record<string, any>;       // keyed by nodeId
    connections: Record<string, any>;  // keyed by edgeId
}

// ── Read ──

export function loadGraphFromStorage(versionId: string): StoredGraph | null {
    try {
        const raw = localStorage.getItem(getStorageKey(versionId));
        if (!raw) return null;
        return JSON.parse(raw) as StoredGraph;
    } catch {
        console.warn('[skillGraphStorage] Failed to parse localStorage for', versionId);
        return null;
    }
}

// ── Full Write (used on API load to seed / replace) ──

export function saveGraphToStorage(
    versionId: string,
    nodes: Record<string, any>,
    connections: Record<string, any>
): void {
    const payload: StoredGraph = { nodes, connections };
    localStorage.setItem(getStorageKey(versionId), JSON.stringify(payload));
}

// ── Node CRUD ──

export function upsertNodeInStorage(versionId: string, nodeId: string, nodeObject: any): void {
    const graph = loadGraphFromStorage(versionId) || { nodes: {}, connections: {} };
    graph.nodes[nodeId] = nodeObject;
    localStorage.setItem(getStorageKey(versionId), JSON.stringify(graph));
}

export function removeNodeFromStorage(versionId: string, nodeId: string): void {
    const graph = loadGraphFromStorage(versionId);
    if (!graph) return;
    delete graph.nodes[nodeId];

    // Also remove any connections that reference this node
    for (const [edgeId, conn] of Object.entries(graph.connections)) {
        if (conn.source === nodeId || conn.target === nodeId) {
            delete graph.connections[edgeId];
        }
    }

    localStorage.setItem(getStorageKey(versionId), JSON.stringify(graph));
}

// ── Connection CRUD ──

export function upsertConnectionInStorage(versionId: string, edgeId: string, edgeData: any): void {
    const graph = loadGraphFromStorage(versionId) || { nodes: {}, connections: {} };
    graph.connections[edgeId] = edgeData;
    localStorage.setItem(getStorageKey(versionId), JSON.stringify(graph));
}

export function removeConnectionFromStorage(versionId: string, edgeId: string): void {
    const graph = loadGraphFromStorage(versionId);
    if (!graph) return;
    delete graph.connections[edgeId];
    localStorage.setItem(getStorageKey(versionId), JSON.stringify(graph));
}

// ── Clear ──

export function clearGraphStorage(versionId: string): void {
    localStorage.removeItem(getStorageKey(versionId));
}
