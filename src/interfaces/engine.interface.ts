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

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'waiting';

export interface NodeExecutionTrace {
    nodeId: string;
    label: string;
    type: string;
    status: Exclude<NodeExecutionStatus, 'idle' | 'running'>;
    message: string;
    input: any;
    data: any;
}

export interface ExecutedNodeStep {
    node: import('@xyflow/react').Node;
    status: NodeExecutionStatus;
    message?: string;
    data?: any;
    inputData?: any;
    outputData?: any;
}
