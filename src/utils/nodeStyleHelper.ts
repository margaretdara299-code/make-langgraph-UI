export function getNodeTheme(type: string, capability?: string, category?: string) {
    // Explicit error node type — always red regardless of category
    if (type === 'error') {
        return { bg: 'var(--color-error-bg)', stroke: 'var(--color-error)', badgeBg: 'var(--color-error)', iconBg: '#FFFFFF' };
    }

    if (type === 'decision' || type === 'router') {
        // Orange / Routing
        return { bg: 'var(--color-warning-bg)', stroke: 'var(--color-warning)', badgeBg: 'var(--color-warning)', iconBg: 'var(--color-warning-bg)' };
    }

    if (type === 'queue') {
        // Amber — durable hand-off / workflow boundary
        return { bg: 'var(--tag-orange-bg)', stroke: 'var(--color-node-queue)', badgeBg: 'var(--color-node-queue)', iconBg: 'var(--accent-soft)' };
    }
    
    if (type === 'start') {
        return { bg: 'var(--tag-indigo-bg)', stroke: 'var(--tag-indigo-color)', badgeBg: 'var(--tag-indigo-color)', iconBg: '#FFFFFF' };
    }

    if (type === 'parallel_split') {
        return { bg: 'var(--tag-pink-bg)', stroke: 'var(--color-node-split)', badgeBg: 'var(--color-node-split)', iconBg: '#FFFFFF' };
    }

    if (type === 'parallel_join') {
        return { bg: 'var(--tag-indigo-bg)', stroke: 'var(--color-node-join)', badgeBg: 'var(--color-node-join)', iconBg: '#FFFFFF' };
    }
    
    if (type === 'end') {
        return { bg: 'var(--surface-1)', stroke: 'var(--text-main)', badgeBg: 'var(--text-main)', iconBg: '#FFFFFF' };
    }

    const cap = (capability || '').toLowerCase();
    
    // DB / Connector - Bright Sky Blue (User approved)
    if (cap === 'database' || cap.includes('db')) {
        return { bg: 'var(--color-node-connector-bg)', stroke: 'var(--color-node-connector)', badgeBg: 'var(--color-node-connector)', iconBg: '#FFFFFF' };
    }
    
    // Skill - Pink/Magenta
    if (cap === 'skill' || cap === 'human') {
        return { bg: 'var(--tag-pink-bg)', stroke: 'var(--tag-pink-color)', badgeBg: 'var(--tag-pink-color)', iconBg: '#FFFFFF' };
    }

    // Status - Teal / Dark Green
    if (cap === 'status' || cap.includes('update')) {
        return { bg: 'var(--tag-emerald-bg)', stroke: 'var(--tag-emerald-color)', badgeBg: 'var(--tag-emerald-color)', iconBg: '#FFFFFF' };
    }

    // Default LLM / API / Action - Blue
    return { bg: '#F0F9FF', stroke: '#0369A1', badgeBg: '#0369A1', iconBg: '#FFFFFF' };
}

type NodeColorSource = {
    type?: string;
    data?: {
        capability?: string;
        category?: string;
    };
} | null | undefined;

export function getNodeStrokeColor(node: NodeColorSource): string {
    const nodeType = (node?.type || 'action').toLowerCase();
    const capability = node?.data?.capability;
    const category = node?.data?.category;

    if (nodeType === 'connector') {
        return getNodeTheme('connector', 'database', category).stroke;
    }

    if (nodeType === 'subflow') {
        return getNodeTheme('skill', 'skill', category).stroke;
    }

    if (nodeType === 'decision' || nodeType === 'router') {
        return getNodeTheme('decision', capability, category).stroke;
    }

    if (nodeType === 'error') {
        return getNodeTheme('error').stroke;
    }

    if (nodeType === 'queue') {
        return getNodeTheme('queue').stroke;
    }

    if (nodeType === 'parallel_split' || nodeType === 'parallel_join') {
        return getNodeTheme(nodeType).stroke;
    }

    return getNodeTheme(nodeType, capability, category).stroke;
}
