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

    // Build a set of node IDs that have been revealed (non-idle)
    const revealedNodeIds = new Set(
        steps.filter(s => s.status !== 'idle').map(s => s.node.id)
    );

    return nodes.map((node) => {
        const matchingSteps = steps.filter((step) => step.node.id === node.id && step.status !== 'idle');
        const latestStep = matchingSteps[matchingSteps.length - 1];

        if (!latestStep) {
            // Parallel join that is waiting: execution is running but this merge hasn't been reached yet
            const isWaitingMerge =
                node.type === 'parallel_join' &&
                isExecuting &&
                !revealedNodeIds.has(node.id);

            return {
                ...node,
                className: appendClassName(
                    node.className,
                    isWaitingMerge ? 'exec-debugger-node--waiting' : 'exec-debugger-node--dimmed'
                ),
                ...(isWaitingMerge
                    ? { data: { ...(node.data ?? {}), executionStatus: 'waiting' } }
                    : {}),
            } as CanvasNode;
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
    steps: ExecutedNodeStep[],
    isExecuting: boolean,
    isSimulationDone: boolean
): Edge[] {
    if (!isExecuting && !isSimulationDone) return edges;

    const revealedSteps = getActiveExecutionSteps(steps);

    if (revealedSteps.length === 0) {
        return edges;
    }

    // Build a map: nodeId -> latest revealed step (for O(1) lookups)
    const revealedStepMap = new Map<string, ExecutedNodeStep>();
    for (const step of revealedSteps) {
        revealedStepMap.set(step.node.id, step);
    }

    // Build a set of revealed node IDs
    const revealedNodeIds = new Set(revealedStepMap.keys());

    // ── Fan-out count: for each active source, count total outgoing edges ──
    // When a Split has 3 branches, each branch edge gets ballCount=3
    // so the viewer sees 3 balls diverging from the split point simultaneously.
    const fanOutCount = new Map<string, number>();
    for (const edge of edges) {
        if (revealedNodeIds.has(edge.source)) {
            fanOutCount.set(edge.source, (fanOutCount.get(edge.source) ?? 0) + 1);
        }
    }

    return edges.map((edge) => {
        const sourceRevealed = revealedNodeIds.has(edge.source);
        const targetRevealed = revealedNodeIds.has(edge.target);
        const isPathActive = sourceRevealed && targetRevealed;

        let isErrorPath = Boolean((edge.data as { isErrorPath?: boolean } | undefined)?.isErrorPath);

        // Number of parallel branches from this source (>1 means it's a fan-out edge)
        const srcFanOut = fanOutCount.get(edge.source) ?? 1;
        const parallelBalls = srcFanOut > 1 ? srcFanOut : 1;

        if (!isPathActive) {
            // Source revealed but target not yet reached → branch is in-flight
            if (sourceRevealed && isExecuting) {
                const sourceStep = revealedStepMap.get(edge.source);
                if (sourceStep && (sourceStep.status === 'running' || sourceStep.status === 'success')) {
                    return {
                        ...edge,
                        animated: true,
                        data: {
                            ...(edge.data ?? {}),
                            // Tag with ball count so DeletableEdge renders N staggered balls
                            _execBalls: parallelBalls,
                        },
                        style: {
                            ...edge.style,
                            stroke: 'var(--color-primary)',
                            strokeWidth: 3,
                            opacity: 0.9,
                            filter: 'drop-shadow(0 0 5px var(--color-primary))',
                        },
                    };
                }
            }

            // Fully dimmed — not part of active execution path
            return {
                ...edge,
                animated: false,
                data: { ...(edge.data ?? {}), _execBalls: 1 },
                style: {
                    ...edge.style,
                    opacity: 0.15,
                    filter: 'none',
                },
            };
        }

        // Both endpoints revealed — determine status from target
        const targetStep = revealedStepMap.get(edge.target);
        const status: NodeExecutionStatus = targetStep
            ? (targetStep.node.type === 'error' ? 'error' : targetStep.status)
            : 'idle';
        isErrorPath = isErrorPath || targetStep?.node.type === 'error';

        if (status === 'running') {
            return {
                ...edge,
                animated: true,
                data: { ...(edge.data ?? {}), _execBalls: parallelBalls },
                style: {
                    ...edge.style,
                    stroke: 'var(--color-primary)',
                    strokeWidth: 3,
                    opacity: 1,
                    filter: 'drop-shadow(0 0 5px var(--color-primary))',
                },
            };
        }

        if (status === 'success') {
            return {
                ...edge,
                animated: false,
                data: { ...(edge.data ?? {}), _execBalls: 1 },
                style: {
                    ...edge.style,
                    stroke: 'var(--color-success)',
                    strokeWidth: 2.5,
                    opacity: 0.9,
                    filter: 'none',
                },
            };
        }

        if (status === 'error') {
            return {
                ...edge,
                animated: false,
                data: { ...(edge.data ?? {}), _execBalls: 1 },
                style: {
                    ...edge.style,
                    stroke: 'var(--color-error)',
                    strokeWidth: 3,
                    strokeDasharray: isErrorPath ? '6 3' : edge.style?.strokeDasharray,
                    opacity: 1,
                    filter: 'none',
                },
            };
        }

        return edge;
    });
}
