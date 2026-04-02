/**
 * useExecutionStepper hook.
 * Manages the state for the simulated vertical stepper execution.
 */

import { useState, useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { engineService } from '@/services';
import { message } from 'antd';
import type { ExecutedNodeStep } from '@/interfaces';

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

    const runExecution = useCallback(async (versionId: string, nodes: Node[], edges: Edge[]) => {
        if (!versionId || !nodes || nodes.length === 0) return;
        
        setIsExecuting(true);
        setIsFetching(true);
        setIsSimulationDone(false);
        setGlobalLogs([]);
        setSteps([]);
        setActiveStepIndex(-1);
        shouldStop.current = false;

        try {
            // 1. Call the backend
            const rawResponse = await engineService.runSkillWorkflow(versionId);

            // Our http interceptor wraps the data in { data: transformedPayload, message } 
            // OR if it didn't match the envelope, it's just the original object.
            const payload = rawResponse?.data || rawResponse;

            // The interceptor transforms snake_case to camelCase: node_responses -> nodeResponses
            const logs = payload?.logs || payload?.data?.logs || [];
            const nodeResponsesData = payload?.nodeResponses || payload?.node_responses || payload?.data?.node_responses || {};

            if (logs.length > 0) setGlobalLogs(logs);

            setIsFetching(false);

            // 2. Flatten the graph (Topological Sort / BFS) to create the stepper sequence
            const startNode = nodes.find(n => n.type === 'start');
            if (!startNode) {
                message.error('Execution requires a Workflow Entry (Start) node.');
                setIsExecuting(false);
                return;
            }

            const sequence: Node[] = [];
            const visited = new Set<string>();
            const queue: Node[] = [startNode];

            while (queue.length > 0) {
                const current = queue.shift()!;
                if (!visited.has(current.id)) {
                    visited.add(current.id);
                    sequence.push(current);
                    
                    // Add children that haven't been visited
                    const childrenEdges = edges.filter(e => e.source === current.id);
                    for (const currEdge of childrenEdges) {
                        const childNode = nodes.find(n => n.id === currEdge.target);
                        if (childNode && !visited.has(childNode.id)) {
                            queue.push(childNode);
                        }
                    }
                }
            }

            // Initialize all steps as idle
            setSteps(sequence.map(n => ({
                node: n,
                status: 'idle'
            })));

            // 3. Execution Loop
            for (let i = 0; i < sequence.length; i++) {
                if (shouldStop.current) break;
                
                setActiveStepIndex(i);
                
                const currentNode = sequence[i];

                // Mark current as running
                setSteps(prev => prev.map((step, idx) => 
                    idx === i ? { ...step, status: 'running' } : step
                ));

                // Wait 1 second for visual effect
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (shouldStop.current) break;

                // Grab node specific response
                let nodeResponseRef = nodeResponsesData?.[currentNode.id];
                
                if (!nodeResponseRef) {
                    const currentNodeLabel = String(currentNode.data?.label || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    nodeResponseRef = Object.values(nodeResponsesData || {}).find((res: any) => {
                        const resNodeLabel = String(res?.data?.node || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                        return resNodeLabel && (currentNodeLabel.includes(resNodeLabel) || resNodeLabel.includes(currentNodeLabel));
                    });
                }

                const isSuccess = nodeResponseRef ? (nodeResponseRef.status === true || nodeResponseRef.status === 'success') : true;

                // Mark final status without overwriting static objects
                setSteps(prev => prev.map((step, idx) => {
                    if (idx === i) {
                        return { 
                            ...step, 
                            status: isSuccess ? 'success' : 'error',
                            data: nodeResponseRef ? { 
                                message: nodeResponseRef.message || 'Node completed', 
                                data: nodeResponseRef.data || nodeResponseRef
                            } : undefined,
                            inputData: nodeResponseRef?.input || nodeResponseRef?.data?.input || step.inputData || { _hint: "Input payload currently not provided by backend" }
                        };
                    }
                    return step;
                }));

                if (!isSuccess) {
                    message.error(`Execution failed at: ${currentNode.data?.label || 'Node'}`);
                    shouldStop.current = true;
                    break;
                }
            }

            // Execution Loop Finished
            if (!shouldStop.current) {
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
