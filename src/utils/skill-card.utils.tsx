/**
 * Utilities for the SkillCard component.
 */

import { Link } from 'react-router-dom';
import type { MenuProps } from 'antd';
import {
    SettingOutlined,
    PartitionOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    UndoOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { CARD_ACTION_KEYS } from '@/constants';

export function getMenuItems(status: string, skillId: string, versionId?: string): MenuProps['items'] {
    const items: MenuProps['items'] = [
        {
            key: CARD_ACTION_KEYS.BUILD_SKILL,
            icon: <PartitionOutlined />,
            label: versionId ? (
                <Link to={`/skills/${skillId}/versions/${versionId}/design`} className="skill-card-menu-link">
                    Build Skill
                </Link>
            ) : 'Build Skill',
            className: 'skill-card__menu-item-build skill-card-menu-item-primary'
        },
        {
            key: CARD_ACTION_KEYS.EDIT_SETTINGS,
            icon: <SettingOutlined />,
            label: 'Edit'
        },
        {
            key: CARD_ACTION_KEYS.TEST,
            icon: <PlayCircleOutlined />,
            label: 'Test'
        },
        { type: 'divider' },
    ];

    if (status === 'draft') {
        items.push({ key: CARD_ACTION_KEYS.PUBLISH, icon: <CheckCircleOutlined />, label: 'Publish' });
    } else if (status === 'published') {
        items.push({ key: CARD_ACTION_KEYS.UNPUBLISH, icon: <UndoOutlined />, label: 'Unpublish' });
    }

    items.push({ type: 'divider' });
    items.push({ key: CARD_ACTION_KEYS.DELETE, icon: <DeleteOutlined />, label: 'Delete', danger: true });

    return items;
}

/** Premium color palette for tags - expanded for better variety */
export const TAG_COLOR_PALETTE = [
    { bg: '#EFF6FF', color: '#2563EB' }, // Blue
    { bg: '#F0FDF4', color: '#16A34A' }, // Green
    { bg: '#FAF5FF', color: '#9333EA' }, // Purple
    { bg: '#FFF7ED', color: '#EA580C' }, // Orange
    { bg: '#FFF1F2', color: '#E11D48' }, // Rose
    { bg: '#F5F3FF', color: '#7C3AED' }, // Indigo
    { bg: '#ECFDF5', color: '#059669' }, // Emerald
    { bg: '#FEF3C7', color: '#D97706' }, // Amber
    { bg: '#FDF2F8', color: '#DB2777' }, // Pink
    { bg: '#ECFEFF', color: '#0891B2' }, // Cyan
];

/** 
 * Robust deterministic tag style generator (DJB2 Hash).
 * Ensures a better color distribution to avoid collisions between different tags.
 */
export const getTagStyle = (name: string) => {
    let hash = 5381;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) + hash) + name.charCodeAt(i);
    }
    const index = Math.abs(hash) % TAG_COLOR_PALETTE.length;
    return TAG_COLOR_PALETTE[index];
};
