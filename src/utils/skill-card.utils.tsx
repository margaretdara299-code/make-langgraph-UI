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
    { bg: 'var(--tag-blue-bg)', color: 'var(--tag-blue-color)' },
    { bg: 'var(--tag-green-bg)', color: 'var(--tag-green-color)' },
    { bg: 'var(--tag-purple-bg)', color: 'var(--tag-purple-color)' },
    { bg: 'var(--tag-orange-bg)', color: 'var(--tag-orange-color)' },
    { bg: 'var(--tag-rose-bg)', color: 'var(--tag-rose-color)' },
    { bg: 'var(--tag-indigo-bg)', color: 'var(--tag-indigo-color)' },
    { bg: 'var(--tag-emerald-bg)', color: 'var(--tag-emerald-color)' },
    { bg: 'var(--tag-amber-bg)', color: 'var(--tag-amber-color)' },
    { bg: 'var(--tag-pink-bg)', color: 'var(--tag-pink-color)' },
    { bg: 'var(--tag-cyan-bg)', color: 'var(--tag-cyan-color)' },
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
