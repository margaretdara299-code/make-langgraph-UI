/**
 * Constants for the Skill Designer canvas.
 */

/** Color map for each action capability type */
export const CAPABILITY_COLORS: Record<string, string> = {
    api: '#3b82f6',
    ai: '#8b5cf6',
    rpa: '#f59e0b',
    human: '#10b981',
    rules: '#ef4444',
};

/** Label map for capability badges */
export const CAPABILITY_LABELS: Record<string, string> = {
    api: 'API',
    ai: 'AI',
    rpa: 'RPA',
    human: 'Human',
    rules: 'Rules',
};

/** Default fallback color for unknown capabilities */
export const DEFAULT_CAPABILITY_COLOR = '#94a3b8';
