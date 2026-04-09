export function getNodeTheme(type: string, capability?: string, category?: string) {
    const isError = (category || '').toLowerCase().includes('error');
    if (isError) {
        return { bg: 'rgba(251, 234, 240, 1)', stroke: '#D4537E', badgeBg: '#D4537E', iconBg: 'rgba(255,255,255,0.6)' };
    }

    if (type === 'decision' || type === 'router') {
        return { bg: '#FAEEDA', stroke: '#BA7517', badgeBg: '#BA7517', iconBg: 'rgba(255,255,255,0.6)' };
    }
    
    if (type === 'start') {
        // Distinct subtle purple for Start
        return { bg: '#F3E8FF', stroke: '#9333EA', badgeBg: '#9333EA', iconBg: 'rgba(255,255,255,0.8)' };
    }
    
    if (type === 'end') {
        // Distinct charcoal/slate for End
        return { bg: '#F1F5F9', stroke: '#475569', badgeBg: '#475569', iconBg: 'rgba(255,255,255,0.8)' };
    }

    const cap = (capability || '').toLowerCase();
    if (cap === 'database' || cap.includes('db')) {
        return { bg: '#E1F5EE', stroke: '#1D9E75', badgeBg: '#1D9E75', iconBg: 'rgba(255,255,255,0.6)' };
    }
    
    if (cap === 'skill' || cap === 'human') {
        return { bg: '#FBEAF0', stroke: '#D4537E', badgeBg: '#D4537E', iconBg: 'rgba(255,255,255,0.6)' };
    }

    // Default LLM / API / Action
    return { bg: '#E6F1FB', stroke: '#378ADD', badgeBg: '#378ADD', iconBg: 'rgba(255,255,255,0.6)' };
}
