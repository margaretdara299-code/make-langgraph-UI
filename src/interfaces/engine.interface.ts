/**
 * Engine-related interfaces.
 */

export interface DashboardCounts {
    actions: {
        total: number;
        active: number;
        inactive: number;
        published: number;
        draft: number;
    };
    skills: {
        total: number;
        active: number;
        inactive: number;
        publishedVersions: number;
        draftVersions: number;
    };
}

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export interface ExecutedNodeStep {
    node: import('@xyflow/react').Node;
    status: NodeExecutionStatus;
    data?: any;
    inputData?: any;
}
