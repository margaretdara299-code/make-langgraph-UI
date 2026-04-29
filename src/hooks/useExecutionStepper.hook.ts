/**
 * useExecutionStepper hook.
 * Manages the state for the simulated vertical stepper execution.
 */

import { useState, useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { engineService } from '@/services';
import { message } from 'antd';
import type { ExecutedNodeStep, NodeExecutionTrace, TracedExecutionNode } from '@/interfaces';
import { ensureErrorHandlerStep, reconstructSequenceFromLogs } from '@/utils/execution-stepper.utils';

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
            const nodeResponsesData =
                payload?.nodeResponses ||
                payload?.node_responses ||
                payload?.data?.nodeResponses ||
                payload?.data?.node_responses ||
                {};

            if (logs.length > 0) setGlobalLogs(logs);

            setIsFetching(false);

            // 2. Build the Stepper Sequence based on Actual Execution Logs
            const startNode = nodes.find(n => n.type === 'start');
            if (!startNode) {
                message.error('Execution requires a Workflow Entry (Start) node.');
                setIsExecuting(false);
                return;
            }

            let tracedSequence: TracedExecutionNode[] = [];

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
                tracedSequence = reconstructSequenceFromLogs(logs, nodes, edges, nodeResponsesData);
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
