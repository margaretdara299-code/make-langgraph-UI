import type { Edge, Node } from '@xyflow/react';
import type {
    NodeExecutionResponseMap,
    NodeExecutionTrace,
    ParsedExecutionLog,
    TracedExecutionNode,
} from '@/interfaces';

export function getExecutionNodeLabel(node: Node) {
    return String(node.data?.label || node.id).trim();
}

export function parseExecutionLogs(logs: string[]): ParsedExecutionLog[] {
    return logs.reduce<ParsedExecutionLog[]>((parsedLogs, log) => {
        const match = log.match(/^▶ \[(.*?)\] \((.*?)\)/);
        if (!match) return parsedLogs;

        parsedLogs.push({
            label: match[1].trim(),
            type: match[2]?.trim(),
        });

        return parsedLogs;
    }, []);
}

export function scoreExecutionCandidate(
    candidate: Node,
    previousNode: Node | undefined,
    nextLog: ParsedExecutionLog | undefined,
    nodes: Node[],
    edges: Edge[],
    usedNodeIds: Set<string>
) {
    let score = 0;

    if (!usedNodeIds.has(candidate.id)) {
        score += 2;
    }

    if (previousNode) {
        if (edges.some((edge) => edge.source === previousNode.id && edge.target === candidate.id)) {
            score += 10;
        }

        const isTwoHopReachable = edges
            .filter((edge) => edge.source === previousNode.id)
            .some((edge) => edges.some((nested) => nested.source === edge.target && nested.target === candidate.id));

        if (isTwoHopReachable) {
            score += 4;
        }
    } else if (candidate.type === 'start') {
        score += 10;
    }

    if (nextLog) {
        const outgoingTargets = edges
            .filter((edge) => edge.source === candidate.id)
            .map((edge) => nodes.find((node) => node.id === edge.target))
            .filter((node): node is Node => Boolean(node));

        const pointsToNextLog = outgoingTargets.some((targetNode) => {
            return (
                nextLog.label === targetNode.id ||
                nextLog.label === getExecutionNodeLabel(targetNode) ||
                (nextLog.type && targetNode.type === nextLog.type)
            );
        });

        if (pointsToNextLog) {
            score += 6;
        }
    }

    return score;
}

export function selectExecutionCandidate(
    candidates: Node[],
    previousNode: Node | undefined,
    nextLog: ParsedExecutionLog | undefined,
    nodes: Node[],
    edges: Edge[],
    usedNodeIds: Set<string>
) {
    if (candidates.length <= 1) {
        return candidates[0];
    }

    const scoredCandidates = candidates
        .map((candidate) => {
            let score = scoreExecutionCandidate(candidate, previousNode, nextLog, nodes, edges, usedNodeIds);

            if (nextLog) {
                const candidateEdges = edges.filter((edge) => edge.source === candidate.id);
                const pointsToNextNode = candidateEdges.some((edge) => {
                    const targetNode = nodes.find((node) => node.id === edge.target);
                    if (!targetNode) return false;

                    return (
                        targetNode.id === nextLog.label ||
                        getExecutionNodeLabel(targetNode) === nextLog.label ||
                        (nextLog.type && targetNode.type === nextLog.type)
                    );
                });

                if (pointsToNextNode) {
                    score += 8;
                }
            }

            return { candidate, score };
        })
        .sort((left, right) => right.score - left.score);

    return scoredCandidates[0]?.candidate;
}

export function reconstructSequenceFromLogs(
    logs: string[],
    nodes: Node[],
    edges: Edge[],
    nodeResponsesData: NodeExecutionResponseMap
): TracedExecutionNode[] {
    const parsedLogs = parseExecutionLogs(logs);
    const reconstructed: Node[] = [];
    const usedNodeIds = new Set<string>();

    for (let index = 0; index < parsedLogs.length; index += 1) {
        const currentLog = parsedLogs[index];
        const nextLog = parsedLogs[index + 1];
        const previousNode = reconstructed[reconstructed.length - 1];

        const candidateNodes = nodes.filter((node) => {
            const matchesLabel = getExecutionNodeLabel(node) === currentLog.label || node.id === currentLog.label;
            const matchesType = currentLog.type ? node.type === currentLog.type : true;
            return matchesLabel && matchesType;
        });

        if (candidateNodes.length === 0) {
            continue;
        }

        const nextNode = selectExecutionCandidate(
            candidateNodes,
            previousNode,
            nextLog,
            nodes,
            edges,
            usedNodeIds
        );

        if (!nextNode) {
            continue;
        }

        reconstructed.push(nextNode);
        usedNodeIds.add(nextNode.id);
    }

    return reconstructed.map((node) => ({
        node,
        trace: nodeResponsesData?.[node.id]
            ? {
                nodeId: node.id,
                label: String(node.data?.label || node.id),
                type: String(node.type || 'action'),
                status: nodeResponsesData[node.id]?.status === 'error' ? 'error' : 'success',
                message: nodeResponsesData[node.id]?.message || 'Node executed successfully',
                input: nodeResponsesData[node.id]?.input,
                data: nodeResponsesData[node.id]?.data ?? nodeResponsesData[node.id],
            }
            : undefined,
    }));
}

export function ensureErrorHandlerStep(
    sequence: TracedExecutionNode[],
    nodes: Node[],
    edges: Edge[],
    nodeResponsesData: NodeExecutionResponseMap
) {
    if (sequence.some((item) => item.node.type === 'error')) {
        return sequence;
    }

    const failedIndex = sequence.findIndex((item) => {
        if (item.trace?.status === 'error') return true;
        return nodeResponsesData?.[item.node.id]?.status === 'error';
    });

    if (failedIndex === -1) {
        return sequence;
    }

    const failedNode = sequence[failedIndex].node;
    const errorEdge = edges.find((edge) =>
        edge.source === failedNode.id &&
        nodes.some((node) => node.id === edge.target && node.type === 'error')
    );

    if (!errorEdge) {
        return sequence;
    }

    const errorNode = nodes.find((node) => node.id === errorEdge.target && node.type === 'error');
    if (!errorNode) {
        return sequence;
    }

    const errorResponse = nodeResponsesData?.[errorNode.id];
    const failedResponse = nodeResponsesData?.[failedNode.id];
    const syntheticTrace: NodeExecutionTrace = {
        nodeId: errorNode.id,
        label: String(errorNode.data?.label || errorNode.id),
        type: String(errorNode.type || 'error'),
        status: 'error',
        message: errorResponse?.message || failedResponse?.message || 'Error handler triggered',
        input: errorResponse?.input,
        data: errorResponse?.data ?? errorResponse ?? failedResponse?.data ?? failedResponse,
    };

    return [
        ...sequence.slice(0, failedIndex + 1),
        { node: errorNode, trace: syntheticTrace },
        ...sequence.slice(failedIndex + 1),
    ];
}
