/**
 * Route configuration for the application.
 * Defines all page routes and their associated components.
 */

export const ROUTES = {
    LOGIN: '/login',
    HOME: '/',
    DASHBOARD: '/dashboard',
    SKILLS_LIBRARY: '/skills',
    SKILL_DESIGNER: '/skills/:skillId/versions/:versionId/design',
    ACTION_CATALOG: '/settings/catalog',
    CATEGORIES: '/settings/categories',
    CAPABILITIES: '/settings/capabilities',
    CONNECTORS: '/connectors',
    TOOLS: '/tools',
    WORKFLOW: '/workflow',
} as const;
