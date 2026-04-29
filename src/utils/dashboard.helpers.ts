import { 
    Layers,
    PenLine,
    LayoutGrid,
    ShieldCheck
} from 'lucide-react';
import type { DashboardCounts, Skill } from '@/interfaces';

/**
 * Maps raw API counts into the high-fidelity metric objects used by the dashboard.
 */
export const formatDashboardMetrics = (counts: DashboardCounts | null) => {
    if (!counts) return [];

    const { skills, actions } = counts;

    return [
        {
            label: 'Total Skills',
            value: skills.total,
            color: '#3b82f6',
            icon: Layers
        },
        {
            label: 'Draft Skills',
            value: skills.draftVersions,
            color: '#8b5cf6',
            icon: PenLine
        },
        {
            label: 'Total Actions',
            value: actions.total,
            color: '#10b981',
            icon: LayoutGrid
        },
        {
            label: 'Published Actions',
            value: actions.published,
            color: '#f59e0b',
            icon: ShieldCheck
        },
    ];
};

/**
 * Filters a list of skills based on a search query (name or description).
 */
export const filterActivitiesByQuery = (skills: Skill[], query: string): Skill[] => {
    if (!query) return skills;
    const q = query.toLowerCase();
    return skills.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.description && s.description.toLowerCase().includes(q))
    );
};
