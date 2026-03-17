/**
 * Central dictionary for all backend API endpoints.
 */

export const API_ENDPOINTS = {
    SKILLS: {
        BASE: '/api/skills',
    },
    SKILL_GRAPH: {
        GRAPH: (versionId: string) => `/api/skill-versions/${versionId}/graph`,
        VALIDATE: (versionId: string) => `/api/skill-versions/${versionId}/validate`,
        COMPILE: (versionId: string) => `/api/skill-versions/${versionId}/compile`,
        PUBLISH: (versionId: string) => `/api/skill-versions/${versionId}/publish`,
        RUN: (versionId: string) => `/api/skill-versions/${versionId}/run`,
    },
    ACTIONS: {
        BASE: '/api/actions',
        BY_ID: (actionDefinitionId: string) => `/api/actions/${actionDefinitionId}`,
        UPDATE: (actionDefinitionId: string) => `/api/actions/${actionDefinitionId}`,
        DESIGNER: '/api/designer/actions',
    },
} as const;
