/**
 * Central dictionary for all backend API endpoints.
 */

export const API_V1_BASE = '/api/v1';

export const API_ENDPOINTS = {
    CATEGORIES: {
        BASE: `${API_V1_BASE}/categories`,
        BY_ID: (categoryId: string) => `${API_V1_BASE}/categories/${categoryId}`,
    },
    SKILLS: {
        BASE: `${API_V1_BASE}/skills`,
        BY_ID: (skillId: string) => `${API_V1_BASE}/skills/${skillId}`,
        UPDATE: (skillId: string) => `${API_V1_BASE}/skills/${skillId}`,
        VERSION_STATUS: (versionId: string) => `${API_V1_BASE}/skill-versions/${versionId}/status`,
    },
    CAPABILITIES: {
        BASE: `${API_V1_BASE}/capabilities`,
        BY_ID: (capabilityId: string) => `${API_V1_BASE}/capabilities/${capabilityId}`,
    },
    SKILL_GRAPH: {
        GRAPH: (versionId: string) => `${API_V1_BASE}/skill-versions/${versionId}/graph`,
        VALIDATE: (versionId: string) => `${API_V1_BASE}/skill-versions/${versionId}/validate`,
        COMPILE: (versionId: string) => `${API_V1_BASE}/skill-versions/${versionId}/compile`,
        PUBLISH: (versionId: string) => `${API_V1_BASE}/skill-versions/${versionId}/status`,
        RUN: (versionId: string) => `${API_V1_BASE}/skill-versions/${versionId}/run`,
    },
    ACTIONS: {
        BASE: `${API_V1_BASE}/actions`,
        GROUPED: `${API_V1_BASE}/actions/grouped`,
        BY_ID: (actionDefinitionId: string) => `${API_V1_BASE}/actions/${actionDefinitionId}`,
        UPDATE: (actionDefinitionId: string) => `${API_V1_BASE}/actions/${actionDefinitionId}`,
        DESIGNER: `${API_V1_BASE}/designer/actions`,
    },
    CONNECTORS: {
        BASE: `${API_V1_BASE}/connectors`,
        GROUPED: `${API_V1_BASE}/connectors/grouped`,
        BY_ID: (connectorId: string) => `${API_V1_BASE}/connectors/${connectorId}`,
    },
    ENGINE: {
        COUNTS: `${API_V1_BASE}/engine/counts`,
        GENERATE_CODE: (versionId: string) => `${API_V1_BASE}/engine/generate-code/${versionId}`,
        RUN: (versionId: string) => `${API_V1_BASE}/engine/run/${versionId}`,
    },
} as const;
