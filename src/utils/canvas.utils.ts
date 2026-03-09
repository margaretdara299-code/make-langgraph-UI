/**
 * Utility functions for the visual orchestrator canvas.
 */

let nodeIdCounter = 0;

/**
 * Generates a unique sequential ID for new canvas nodes.
 */
export function getNextNodeId(): string {
    return `node-${++nodeIdCounter}`;
}
