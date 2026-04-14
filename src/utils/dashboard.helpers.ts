import { useMemo } from 'react';
import { 
    BulbOutlined, 
    ThunderboltOutlined, 
    SettingOutlined, 
    AppstoreOutlined 
} from '@ant-design/icons';
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
            color: '#6366f1',
            icon: BulbOutlined
        },
        {
            label: 'Draft Skills',
            value: skills.draftVersions,
            color: '#10b981',
            icon: BulbOutlined
        },
        {
            label: 'Total Actions',
            value: actions.total,
            color: '#f59e0b',
            icon: SettingOutlined
        },
        {
            label: 'Published Actions',
            value: actions.published,
            color: '#ec4899',
            icon: AppstoreOutlined
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
