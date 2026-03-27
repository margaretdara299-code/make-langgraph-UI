/**
 * UI-related constants (menus, display defaults, etc.)
 */
import type { MenuProps } from 'antd';

/** Common Edit/Delete menu for listing cards */
export const CARD_MENU_ITEMS: MenuProps['items'] = [
    { key: 'edit', label: 'Edit' },
    { type: 'divider' },
    { key: 'delete', label: 'Delete', danger: true },
];
