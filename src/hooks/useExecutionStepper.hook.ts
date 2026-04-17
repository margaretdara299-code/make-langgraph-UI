/**
 * useExecutionStepper hook.
 * Manages the state for the simulated vertical stepper execution.
 */

import { useState, useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { engineService } from '@/services';
import { message } from 'antd';
import type { ExecutedNodeStep, NodeExecutionTrace } from '@/interfaces';

type TracedExecutionNode = { node: Node; trace?: NodeExecutionTrace };

function ensureErrorHandlerStep(
    sequence: TracedExecutionNode[],
    nodes: Node[],
    edges: Edge[],
    nodeResponsesData: Record<string, any>
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

export function useExecutionStepper() {
    const [isExecuting, setIsExecuting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isSimulationDone, setIsSimulationDone] = useState(false);
    const [globalLogs, setGlobalLogs] = useState<string[]>([]);
    
    // The ordered array of execution steps to display in the vertical view
    const [steps, setSteps] = useState<ExecutedNodeStep[]>([]);
    const [activeStepIndex, setActiveStepIndex] = useState(-1);

    const shouldStop = useRef(false);

    const resetStepper = useCallback(() => {
        setIsExecuting(false);
        setIsFetching(false);
        setIsSimulationDone(false);
        setGlobalLogs([]);
        setSteps([]);
        setActiveStepIndex(-1);
        shouldStop.current = false;
    }, []);

    const runExecution = useCallback(async (versionId: string, nodes: Node[], edges: Edge[], initialData?: Record<string, any>) => {
        if (!versionId || !nodes || nodes.length === 0) return;
        
        setIsExecuting(true);
        setIsFetching(true);
        setIsSimulationDone(false);
        setGlobalLogs([]);
        setSteps([]);
        setActiveStepIndex(-1);
        shouldStop.current = false;
        let encounteredFailure = false;

        try {
            // 1. Call the backend
            const rawResponse = await engineService.runSkillWorkflow(versionId, initialData);

            // Our http interceptor wraps the data in { data: transformedPayload, message } 
            // OR if it didn't match the envelope, it's just the original object.
            const payload = rawResponse?.data || rawResponse;

            // The interceptor transforms snake_case to camelCase: node_traces -> nodeTraces
            const logs = payload?.logs || payload?.data?.logs || [];
            const nodeTraces = (payload?.nodeTraces || payload?.data?.nodeTraces || []) as NodeExecutionTrace[];
            const nodeResponsesData = payload?.nodeResponses || payload?.node_responses || payload?.data?.node_responses || {};

            if (logs.length > 0) setGlobalLogs(logs);

            setIsFetching(false);

            // 2. Build the Stepper Sequence based on Actual Execution Logs
            const startNode = nodes.find(n => n.type === 'start');
            if (!startNode) {
                message.error('Execution requires a Workflow Entry (Start) node.');
                setIsExecuting(false);
                return;
            }

            let tracedSequence: Array<{ node: Node; trace?: NodeExecutionTrace }> = [];

            if (nodeTraces.length > 0) {
                tracedSequence = nodeTraces
                    .map((trace) => {
                        const node = nodes.find((candidate) => candidate.id === trace.nodeId);
                        if (!node) return null;
                        return { node, trace };
                    })
                    .filter((item): item is { node: Node; trace: NodeExecutionTrace } => Boolean(item));
            }

            // Fallback: If traces are unavailable, reconstruct from logs / graph structure.
            if (tracedSequence.length === 0 && logs && logs.length > 0) {
                const reconstructed: Node[] = [];
                for (const log of logs) {
                    const match = log.match(/^▶ \[(.*?)\] \(/);
                    if (!match) continue;

                    const labelHit = match[1];
                    const candidateNodes = nodes.filter(
                        (node) => String(node.data?.label || '').trim() === labelHit.trim() || node.id === labelHit.trim()
                    );

                    if (reconstructed.length === 0) {
                        const firstMatch = candidateNodes.find((candidate) => candidate.type === 'start') || candidateNodes[0];
                        if (firstMatch) reconstructed.push(firstMatch);
                        continue;
                    }

                    const lastNode = reconstructed[reconstructed.length - 1];
                    const connectedCandidate = candidateNodes.find((candidate) => {
                        const isDirectChild = edges.some((edge) => edge.source === lastNode.id && edge.target === candidate.id);
                        if (isDirectChild) return true;

                        const childrenEdges = edges.filter((edge) => edge.source === lastNode.id);
                        return childrenEdges.some((childEdge) =>
                            edges.some((nestedEdge) => nestedEdge.source === childEdge.target && nestedEdge.target === candidate.id)
                        );
                    });

                    const nextNode = connectedCandidate || candidateNodes[0];
                    if (nextNode) reconstructed.push(nextNode);
                }

                tracedSequence = reconstructed.map((node) => ({
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

            if (tracedSequence.length === 0) {
                const visited = new Set<string>();
                const queue: Node[] = [startNode];
                const fallbackSequence: Node[] = [];

                while (queue.length > 0) {
                    const current = queue.shift()!;
                    if (!visited.has(current.id)) {
                        visited.add(current.id);
                        fallbackSequence.push(current);
                        
                        const childrenEdges = edges.filter(e => e.source === current.id);
                        for (const currEdge of childrenEdges) {
                            const childNode = nodes.find(n => n.id === currEdge.target);
                            if (childNode && !visited.has(childNode.id)) {
                                queue.push(childNode);
                            }
                        }
                    }
                }

                tracedSequence = fallbackSequence.map((node) => ({
                    node,
                    trace: undefined,
                }));
            }

            tracedSequence = ensureErrorHandlerStep(tracedSequence, nodes, edges, nodeResponsesData);

            // Initialize all steps as idle
            setSteps(tracedSequence.map(({ node }) => ({
                node,
                status: 'idle'
            })));

            // 3. Execution Loop
            for (let i = 0; i < tracedSequence.length; i++) {
                if (shouldStop.current) break;
                
                setActiveStepIndex(i);
                
                const { node: currentNode, trace } = tracedSequence[i];

                // Mark current as running
                setSteps(prev => prev.map((step, idx) => 
                    idx === i
                        ? {
                            ...step,
                            status: 'running',
                            message: trace?.message || 'Executing node...',
                            inputData: trace?.input || step.inputData,
                        }
                        : step
                ));

                // Wait 1 second for visual effect
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (shouldStop.current) break;

                const isSuccess = trace ? trace.status !== 'error' : true;
                const outputData = trace?.data ?? nodeResponsesData?.[currentNode.id]?.data ?? nodeResponsesData?.[currentNode.id];

                // Mark final status without overwriting static objects
                setSteps(prev => prev.map((step, idx) => {
                    if (idx === i) {
                        return { 
                            ...step, 
                            status: isSuccess ? 'success' : 'error',
                            message: trace?.message || (isSuccess ? 'Node completed' : 'Node failed'),
                            data: outputData ? { message: trace?.message || 'Node completed', data: outputData } : undefined,
                            inputData: trace?.input || step.inputData || { _hint: "Input payload currently not provided by backend" },
                            outputData,
                        };
                    }
                    return step;
                }));

                if (!isSuccess && !encounteredFailure) {
                    encounteredFailure = true;
                    message.error(`Execution failed at: ${currentNode.data?.label || 'Node'}`);
                }
            }

            // Execution Loop Finished
            if (!shouldStop.current && !encounteredFailure) {
                message.success('Workflow finished executing!');
            }
            setIsSimulationDone(true);

        } catch (error: any) {
            console.error('Execution Error:', error);
            message.error(error?.message || 'Failed to execute workflow');
            setIsFetching(false);
            setIsSimulationDone(true); // even on error done
        } finally {
            setIsExecuting(false);
        }
    }, []);

    const stopExecution = useCallback(() => {
        shouldStop.current = true;
        setIsExecuting(false);
        setIsFetching(false);
        setIsSimulationDone(true);
    }, []);

    return {
        isExecuting,
        isFetching,
        isSimulationDone,
        globalLogs,
        steps,
        activeStepIndex,
        runExecution,
        stopExecution,
        resetStepper
    };
}
