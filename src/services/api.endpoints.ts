/**
 * Central dictionary for all backend API endpoints.
 */

export const API_ENDPOINTS = {
    CATEGORIES: {
        BASE: '/api/v1/categories',
        BY_ID: (categoryId: number) => `/api/v1/categories/${categoryId}`,
    },
    SKILLS: {
        BASE: '/api/skills',
        BY_ID: (skillId: string) => `/api/skills/${skillId}`,
        UPDATE: (skillId: string) => `/api/skills/${skillId}`,
        VERSION_STATUS: (versionId: string) => `/api/skills/versions/${versionId}/status`,
    },
    CAPABILITIES: {
        BASE: '/api/v1/capabilities',
        BY_ID: (capabilityId: number) => `/api/v1/capabilities/${capabilityId}`,
    },
    SKILL_GRAPH: {
        GRAPH: (versionId: string) => `/api/skills/versions/${versionId}/graph`,
        VALIDATE: (versionId: string) => `/api/skills/versions/${versionId}/validate`,
        COMPILE: (versionId: string) => `/api/skills/versions/${versionId}/compile`,
        PUBLISH: (versionId: string) => `/api/skills/versions/${versionId}/status`,
        RUN: (versionId: string) => `/api/skills/versions/${versionId}/run`,
    },
    ACTIONS: {
        BASE: '/api/actions',
        GROUPED: '/api/actions/grouped',
        BY_ID: (actionDefinitionId: string) => `/api/actions/${actionDefinitionId}`,
        UPDATE: (actionDefinitionId: string) => `/api/actions/${actionDefinitionId}`,
        DESIGNER: '/api/designer/actions',
    },
    CONNECTORS: {
        BASE: '/api/v1/connectors',
        GROUPED: '/api/v1/connectors/grouped',
        BY_ID: (connectorId: number) => `/api/v1/connectors/${connectorId}`,
    },
} as const;
