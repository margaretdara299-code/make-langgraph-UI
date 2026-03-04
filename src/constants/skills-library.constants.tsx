/**
 * Constants for the Skills Library page.
 */

import {
    AppstoreOutlined,
    EditOutlined,
    CheckCircleOutlined,
    InboxOutlined,
} from '@ant-design/icons';

export const STATUS_FILTER_OPTIONS = [
    { key: 'all', label: 'All Skills' },
    { key: 'draft', label: 'Draft' },
    { key: 'published', label: 'Published' },
    { key: 'archived', label: 'Archived' },
] as const;

/** Icon mapping for sidebar status filter items */
export const STATUS_ICONS: Record<string, React.ReactNode> = {
    all: <AppstoreOutlined />,
    draft: <EditOutlined />,
    published: <CheckCircleOutlined />,
    archived: <InboxOutlined />,
};

export const SKILLS_PAGE_SIZE = 12;
