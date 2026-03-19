/**
 * Utilities for the SkillCard component.
 */

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

/** Build menu items based on skill status */
export function getMenuItems(status: string): MenuProps['items'] {
    const items: MenuProps['items'] = [
        { 
            key: CARD_ACTION_KEYS.BUILD_SKILL, 
            icon: <PartitionOutlined />, 
            label: 'Build Skill',
            className: 'skill-card__menu-item-build',
            style: { color: 'var(--color-primary)', fontWeight: 600 }
        },
        { 
            key: CARD_ACTION_KEYS.EDIT_SETTINGS, 
            icon: <SettingOutlined />, 
            label: 'Edit' 
        },
        { key: CARD_ACTION_KEYS.TEST, icon: <PlayCircleOutlined />, label: 'Test' },
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
