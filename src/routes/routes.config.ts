/**
 * Route configuration for the application.
 * Defines all page routes and their associated components.
 */

export const ROUTES = {
    HOME: '/',
    SKILLS_LIBRARY: '/skills',
    SKILL_DESIGNER: '/skills/:skillId/versions/:versionId/design',
    ACTION_CATALOG: '/settings/catalog',
    CONNECTORS: '/connectors',
} as const;
