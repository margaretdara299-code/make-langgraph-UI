/**
 * Utilities for the SkillCard component.
 */

import type { MenuProps } from 'antd';
import {
    EditOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    UndoOutlined,
    InboxOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { CARD_ACTION_KEYS } from '@/constants';

/** Build menu items based on skill status */
export function getMenuItems(status: string): MenuProps['items'] {
    const items: MenuProps['items'] = [
        { key: CARD_ACTION_KEYS.EDIT, icon: <EditOutlined />, label: 'Edit' },
        { key: CARD_ACTION_KEYS.TEST, icon: <PlayCircleOutlined />, label: 'Test' },
        { type: 'divider' },
    ];

    if (status === 'draft') {
        items.push({ key: CARD_ACTION_KEYS.PUBLISH, icon: <CheckCircleOutlined />, label: 'Publish' });
        items.push({ key: CARD_ACTION_KEYS.ARCHIVE, icon: <InboxOutlined />, label: 'Archive' });
    } else if (status === 'published') {
        items.push({ key: CARD_ACTION_KEYS.UNPUBLISH, icon: <UndoOutlined />, label: 'Unpublish' });
        items.push({ key: CARD_ACTION_KEYS.ARCHIVE, icon: <InboxOutlined />, label: 'Archive' });
    } else if (status === 'archived') {
        items.push({ key: CARD_ACTION_KEYS.UNPUBLISH, icon: <UndoOutlined />, label: 'Restore to Draft' });
    }

    items.push({ type: 'divider' });
    items.push({ key: CARD_ACTION_KEYS.DELETE, icon: <DeleteOutlined />, label: 'Delete', danger: true });

    return items;
}
