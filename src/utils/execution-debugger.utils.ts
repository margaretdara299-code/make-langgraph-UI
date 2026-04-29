import type { Edge, Node } from '@xyflow/react';
import type {
    CanvasNode,
    ExecutedNodeStep,
    ExecutionDebuggerStatusBadge,
    ExecutionDebuggerPaneType,
    NodeExecutionStatus,
} from '@/interfaces';

export const EXECUTION_DEBUGGER_PLACEHOLDER_ROWS = [0, 1, 2];

function appendClassName(currentClassName: string | undefined, nextClassName: string) {
    return [currentClassName, nextClassName].filter(Boolean).join(' ');
}

export function isErrorConnectorEdge(edge: Edge, nodes: Node[]) {
    const edgeData = edge.data as { isErrorPath?: boolean } | undefined;
    if (edgeData?.isErrorPath) return true;

    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);

    return sourceNode?.type === 'error' || targetNode?.type === 'error';
}

export function hasRenderablePayload(payload: unknown) {
    if (payload === null || payload === undefined) return false;
    if (typeof payload === 'string') return payload.trim().length > 0;
    if (Array.isArray(payload)) return payload.length > 0;
    if (typeof payload === 'object') return Object.keys(payload as Record<string, unknown>).length > 0;
    return true;
}

export function getExecutionStepNodeLabel(step: ExecutedNodeStep) {
    const nodeData = step.node.data as { label?: string } | undefined;
    return String(nodeData?.label || step.node.type || 'Node');
}

export function getExecutionStepNodeType(step: ExecutedNodeStep) {
    return String(step.node.type || '');
}

export function getExecutionStepPayload(step: ExecutedNodeStep, type: ExecutionDebuggerPaneType) {
    return type === 'input' ? step.inputData : step.outputData ?? step.data?.data ?? step.data;
}

export function getStepCardStatusClass(status: NodeExecutionStatus) {
    if (status === 'running') return 'active';
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    return '';
}

export function getActiveExecutionSteps(steps: ExecutedNodeStep[]) {
    return steps.filter((step) => step.status !== 'idle');
}

export function getExecutionStatusBadge(
    isExecuting: boolean,
    isSimulationDone: boolean,
    steps: ExecutedNodeStep[]
): ExecutionDebuggerStatusBadge {
    if (isExecuting) {
        return {
            label: 'Executing...',
            className: 'exec-debugger-header__badge--running',
            icon: 'loading',
        };
    }

    const hasError = steps.some((step) => step.status === 'error');

    if (isSimulationDone && hasError) {
        return {
            label: 'Failed',
            className: 'exec-debugger-header__badge--error',
            icon: 'error',
        };
    }

    if (isSimulationDone) {
        return {
            label: 'Completed',
            className: 'exec-debugger-header__badge--done',
            icon: 'success',
        };
    }

    return {
        label: 'Initializing...',
        className: 'exec-debugger-header__badge--running',
        icon: 'loading',
    };
}

export function buildExecutionDebuggerNodes(
    nodes: Node[],
    steps: ExecutedNodeStep[],
    isExecuting: boolean,
    isSimulationDone: boolean
): Node[] {
    if (!isExecuting && !isSimulationDone) return nodes;

    return nodes.map((node) => {
        const matchingSteps = steps.filter((step) => step.node.id === node.id && step.status !== 'idle');
        const latestStep = matchingSteps[matchingSteps.length - 1];

        if (!latestStep) {
            return {
                ...node,
                className: appendClassName(node.className, 'exec-debugger-node--dimmed'),
            };
        }

        return {
            ...node,
            data: {
                ...(node.data ?? {}),
                executionStatus: node.type === 'error' ? 'error' : latestStep.status,
            },
        } as CanvasNode;
    });
}

export function buildExecutionDebuggerEdges(
    edges: Edge[],
    nodes: Node[],
    steps: ExecutedNodeStep[],
    isExecuting: boolean,
    isSimulationDone: boolean
): Edge[] {
    if (!isExecuting && !isSimulationDone) return edges;

    const revealedSteps = getActiveExecutionSteps(steps);

    if (revealedSteps.length === 0) {
        return edges;
    }

    return edges.map((edge) => {
        let isPathActive = false;
        let status: NodeExecutionStatus = 'idle';
        const isErrorPath = isErrorConnectorEdge(edge, nodes);
        const strokeDasharray = isErrorPath ? '6 3' : edge.style?.strokeDasharray;

        for (let index = 0; index < revealedSteps.length - 1; index += 1) {
            if (revealedSteps[index].node.id === edge.source && revealedSteps[index + 1].node.id === edge.target) {
                isPathActive = true;
                status = revealedSteps[index + 1].node.type === 'error'
                    ? 'error'
                    : revealedSteps[index + 1].status;
                break;
            }
        }

        if (!isPathActive) {
            return {
                ...edge,
                animated: false,
                style: {
                    ...edge.style,
                    strokeDasharray,
                    opacity: 0.25,
                    filter: 'none',
                },
            };
        }

        if (status === 'running') {
            return {
                ...edge,
                animated: true,
                style: {
                    ...edge.style,
                    stroke: 'var(--color-primary)',
                    strokeWidth: 3,
                    strokeDasharray,
                    opacity: 1,
                    filter: 'drop-shadow(0 0 4px var(--color-primary))',
                },
            };
        }

        if (status === 'success') {
            return {
                ...edge,
                animated: false,
                style: {
                    ...edge.style,
                    stroke: 'var(--color-success)',
                    strokeWidth: 3,
                    strokeDasharray,
                    opacity: 1,
                },
            };
        }

        if (status === 'error') {
            return {
                ...edge,
                animated: false,
                style: {
                    ...edge.style,
                    stroke: 'var(--color-error)',
                    strokeWidth: 3,
                    strokeDasharray,
                    opacity: 1,
                },
            };
        }

        return edge;
    });
}
