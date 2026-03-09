/**
 * Constants for layout components.
 */

import { AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import { ROUTES } from '@/routes';

export const SIDEBAR_MENU_ITEMS = [
    {
        key: ROUTES.SKILLS_LIBRARY,
        icon: <AppstoreOutlined />,
        label: 'Skills Library',
    },
    {
        key: ROUTES.ACTION_CATALOG,
        icon: <SettingOutlined />,
        label: 'Action Catalog',
    },
];
