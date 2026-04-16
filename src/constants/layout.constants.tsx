/**
 * Constants for layout components.
 */

import { BulbOutlined, SettingOutlined, AppstoreOutlined, ThunderboltOutlined, DashboardOutlined, ToolOutlined, PartitionOutlined, DatabaseOutlined } from '@ant-design/icons';
import { ROUTES } from '@/routes';

export const SIDEBAR_MENU_ITEMS = [
    {
        key: ROUTES.DASHBOARD,
        icon: DashboardOutlined,
        label: 'Dashboard',
    },
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
        key: ROUTES.CATEGORIES,
        icon: AppstoreOutlined,
        label: 'Categories',
    },
    {
        key: ROUTES.CAPABILITIES,
        icon: ThunderboltOutlined,
        label: 'Capabilities',
    },
    // {
    //     key: ROUTES.CONNECTORS,
    //     icon: ApiOutlined,
    //     label: 'Connectors',
    // },
    // {
    //     key: ROUTES.VARIABLES,
    //     icon: DatabaseOutlined,
    //     label: 'Variables',
    // },
    {
        key: ROUTES.TOOLS,
        icon: ToolOutlined,
        label: 'Tools',
    },
    {
        key: ROUTES.WORKFLOW,
        icon: PartitionOutlined,
        label: 'Workflow',
    },
];


