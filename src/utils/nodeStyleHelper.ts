export function getNodeTheme(type: string, capability?: string, category?: string) {
    const isError = (category || '').toLowerCase().includes('error');
    if (isError) {
        return { bg: '#FFF5F5', stroke: '#FF4D4F', badgeBg: '#FF4D4F', iconBg: '#FFFFFF' };
    }

    if (type === 'decision' || type === 'router') {
        // Orange / Routing
        return { bg: '#FFF7ED', stroke: '#EA580C', badgeBg: '#EA580C', iconBg: '#FFFFFF' };
    }
    
    if (type === 'start') {
        return { bg: '#F5F3FF', stroke: '#7C3AED', badgeBg: '#7C3AED', iconBg: '#FFFFFF' };
    }
    
    if (type === 'end') {
        return { bg: '#F8FAFC', stroke: '#475569', badgeBg: '#475569', iconBg: '#FFFFFF' };
    }

    const cap = (capability || '').toLowerCase();
    
    // DB / Connector - Green
    if (cap === 'database' || cap.includes('db')) {
        return { bg: '#ECFDF5', stroke: '#10B981', badgeBg: '#10B981', iconBg: '#FFFFFF' };
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

    return getNodeTheme(nodeType, capability, category).stroke;
}

