export function getNodeTheme(type: string, capability?: string, category?: string) {
    // Explicit error node type — always red regardless of category
    if (type === 'error') {
        return { bg: '#FFF5F5', stroke: '#EF4444', badgeBg: '#EF4444', iconBg: '#FFFFFF' };
    }

    if (type === 'decision' || type === 'router') {
        // Orange / Routing
        return { bg: '#FFF7ED', stroke: '#EA580C', badgeBg: '#EA580C', iconBg: '#EA580C' };
    }
    
    if (type === 'start') {
        return { bg: '#F5F3FF', stroke: '#7C3AED', badgeBg: '#7C3AED', iconBg: '#FFFFFF' };
    }
    
    if (type === 'end') {
        return { bg: '#F8FAFC', stroke: '#000000', badgeBg: '#27272A', iconBg: '#FFFFFF' };
    }

    const cap = (capability || '').toLowerCase();
    
    // DB / Connector - Bright Sky Blue (User approved)
    if (cap === 'database' || cap.includes('db')) {
        return { bg: '#F0F9FF', stroke: '#0369A1', badgeBg: '#0369A1', iconBg: '#FFFFFF' };
    }
    
    // Skill - Pink/Magenta
    if (cap === 'skill' || cap === 'human') {
        return { bg: '#FDF2F8', stroke: '#DB2777', badgeBg: '#DB2777', iconBg: '#FFFFFF' };
    }

    // Status - Teal / Dark Green
    if (cap === 'status' || cap.includes('update')) {
        return { bg: '#F0FDFA', stroke: '#0D9488', badgeBg: '#0D9488', iconBg: '#FFFFFF' };
    }

    // Default LLM / API / Action - Blue
    return { bg: '#EFF6FF', stroke: '#2563EB', badgeBg: '#2563EB', iconBg: '#FFFFFF' };
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

    return getNodeTheme(nodeType, capability, category).stroke;
}

