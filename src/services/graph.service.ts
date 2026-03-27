import { apiClient } from './http.service';
import { API_ENDPOINTS } from './api.endpoints';

/**
 * Loads a saved skill graph (nodes and connections) for a specific skill version.
 * Used to hydrate the React Flow layout when editing a skill version.
 * @param skillVersionId The unique identifier of the skill version.
 */
export async function loadSkillGraph(skillVersionId: string) {
    return apiClient.get<{
        skillVersionId: string;
        skillId: string;
        environment: string;
        version: string;
        status: string;
        nodes: unknown[];
        connections: Record<string, unknown>;
    }>(API_ENDPOINTS.SKILL_GRAPH.GRAPH(skillVersionId)).then(res => res.data);
}

/**
 * Overwrites the current skill version graph layout with the provided nodes and connections.
 * @param skillVersionId The unique identifier of the skill version.
 * @param nodes The React Flow node array payload.
 * @param connections The React Flow edge/connection record payload.
 */
export async function saveSkillGraph(
    skillVersionId: string,
    nodes: unknown[],
    connections: Record<string, unknown>
) {
    return apiClient.put(API_ENDPOINTS.SKILL_GRAPH.GRAPH(skillVersionId), {
        nodes,
        connections,
    });
}

/**
 * Validates a skill graph logically to ensure there are no orphaned branches or infinite loops.
 * Outputs a list of errors and warnings.
 * @param skillVersionId The unique identifier of the skill version.
 */
export async function validateSkillGraph(skillVersionId: string) {
    return apiClient.post<{ valid: boolean; errors: string[]; warnings: string[] }>(
        API_ENDPOINTS.SKILL_GRAPH.VALIDATE(skillVersionId)
    ).then(res => res.data);
}

/**
 * Compiles a validated skill graph into an executable state machine JSON object.
 * Returns a compileHash used for tracking version integrity.
 * @param skillVersionId The unique identifier of the skill version.
 */
export async function compileSkillGraph(skillVersionId: string) {
    return apiClient.post<{ compileHash: string; compiledSkillJson: unknown }>(
        API_ENDPOINTS.SKILL_GRAPH.COMPILE(skillVersionId)
    ).then(res => res.data);
}

/**
 * Marks a previously drafted/compiled skill version as officially Published.
 * @param skillVersionId The unique identifier of the skill version.
 * @param notes Optional changelog notes describing the publish intent.
 */
export async function publishSkillVersion(skillVersionId: string, notes?: string) {
    return apiClient.put(
        API_ENDPOINTS.SKILL_GRAPH.PUBLISH(skillVersionId),
        { status: 'published', notes },
    );
}

/**
 * Triggers a live execution of the skill graph using the internal Execution Engine simulator.
 * Steps through the graph until completion or the maxSteps limit is reached.
 * @param skillVersionId The unique identifier of the skill version.
 * @param inputContext Dictionary of input parameters provided to the Trigger node.
 * @param maxSteps Safety limit preventing infinite loops.
 */
export async function runSkillVersion(
    skillVersionId: string,
    inputContext: Record<string, unknown>,
    maxSteps = 200
) {
    return apiClient.post<{
        status: string;
        visited: string[];
        context: Record<string, unknown>;
        lastOutputs: Record<string, unknown>;
    }>(API_ENDPOINTS.SKILL_GRAPH.RUN(skillVersionId), {
        inputContext,
        maxSteps,
    }).then(res => res.data);
}

/**
 * Generates executable LangGraph Python source code for a given skill version.
 * @param skillVersionId The unique identifier of the skill version.
 */
export async function generateCode(skillVersionId: string) {
    return apiClient.get<{ code: string }>(
        API_ENDPOINTS.ENGINE.GENERATE_CODE(skillVersionId)
    ).then(res => res.data);
}
