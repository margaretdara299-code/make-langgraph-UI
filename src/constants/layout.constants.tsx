/**
 * Constants for layout components.
 */

import { BulbOutlined, SettingOutlined, ApiOutlined } from '@ant-design/icons';
import { ROUTES } from '@/routes';

export const SIDEBAR_MENU_ITEMS = [
    {
        key: ROUTES.SKILLS_LIBRARY,
        icon: BulbOutlined,
        label: 'Skills Library',
    },
    {
        key: ROUTES.ACTION_CATALOG,
        icon: SettingOutlined,
        label: 'Action Catalog',
    },
    {
        key: ROUTES.CONNECTORS,
        icon: ApiOutlined,
        label: 'Connectors',
    },
];
