/**
 * Utility functions for the visual orchestrator canvas.
 */

/**
 * Generates a truly unique ID for new canvas nodes, avoiding collisions with saved graphs.
 */
export function getNextNodeId(): string {
    return `node-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
