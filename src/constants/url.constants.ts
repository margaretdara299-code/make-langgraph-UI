/**
 * API URL constants.
 * All backend API endpoint URLs are centralized here.
 * During mock phase, these are not actively used but define the contract.
 */

const API_BASE = '/api';

export const API_URLS = {
    // Skills
    SKILLS: `${API_BASE}/skills`,
    SKILL_BY_ID: (id: string) => `${API_BASE}/skills/${id}`,
    SKILL_VALIDATE: `${API_BASE}/skills/validate`,
    SKILL_SUGGEST_KEY: `${API_BASE}/skills/suggest-key`,

    // Skill Versions
    SKILL_VERSIONS: (skillId: string) => `${API_BASE}/skills/${skillId}/versions`,
    SKILL_VERSION_BY_ID: (skillId: string, versionId: string) =>
        `${API_BASE}/skills/${skillId}/versions/${versionId}`,

    // Graph (Canvas)
    SKILL_GRAPH: (skillId: string, versionId: string) =>
        `${API_BASE}/skills/${skillId}/versions/${versionId}/graph`,
    SKILL_NODE_CONFIG: (skillId: string, versionId: string, nodeId: string) =>
        `${API_BASE}/skills/${skillId}/versions/${versionId}/nodes/${nodeId}/config`,

    // Action Catalog
    ACTIONS: `${API_BASE}/actions`,
    ACTION_BY_ID: (id: string) => `${API_BASE}/actions/${id}`,
    ACTION_VERSIONS: (actionId: string) => `${API_BASE}/actions/${actionId}/versions`,
    ACTION_VERSION_BY_ID: (actionId: string, versionId: string) =>
        `${API_BASE}/actions/${actionId}/versions/${versionId}`,

    // Connectors
    CONNECTORS: `${API_BASE}/connectors`,

    // Compilation & Publishing
    COMPILE: (skillId: string, versionId: string) =>
        `${API_BASE}/skills/${skillId}/versions/${versionId}/compile`,
    PUBLISH: (skillId: string, versionId: string) =>
        `${API_BASE}/skills/${skillId}/versions/${versionId}/publish`,
} as const;
