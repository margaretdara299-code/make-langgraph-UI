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

/** 
 * Centralized content for all page headers across the studio.
 * Helps in maintaining consistent 'Industry Level' copy for titles and descriptions.
 */
export const PAGE_HEADER_CONTENT = {
    DASHBOARD: {
        title: 'Dashboard Overview',
        description: "Monitor your studio's health, track skill deployments, and view live activity.",
        updatesTitle: 'Recent Skill Updates',
        updatesDescription: 'Live activity log of deployments and studio events.'
    },
    SKILLS_LIBRARY: {
        title: 'Skills Library',
        description: 'Manage and deploy your automated skills and complex orchestration flows.'
    },
    ACTION_CATALOG: {
        title: 'Action Catalog',
        description: 'Browse and manage available action definitions for your skills.'
    },
    CATEGORIES: {
        title: 'Categories',
        description: 'Organize and manage your logical skill groupings and orchestration clusters.'
    },
    CAPABILITIES: {
        title: 'Capabilities',
        description: 'Manage your platform capabilities and core service connectors.'
    }
};
