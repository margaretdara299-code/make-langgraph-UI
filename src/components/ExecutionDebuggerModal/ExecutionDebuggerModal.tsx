/**
 * ExecutionDebuggerModal — Full-screen three-pane execution visualization.
 * Left:   Mini React Flow canvas with live execution animations
 * Middle: Input data per node (progressive reveal)
 * Right:  Output data per node (progressive reveal)
 */

import { useMemo, useRef, useEffect } from 'react';
import { Modal } from 'antd';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    ReactFlowProvider,
    type Node,
    type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Zap, LogIn, LogOut, X, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { NODE_TYPES, EDGE_TYPES } from '@/constants';
import { useExecution } from '@/contexts';
import type { CanvasNode } from '@/interfaces';

import './ExecutionDebuggerModal.css';

interface ExecutionDebuggerModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: Node[];
    edges: Edge[];
}

/** Renders a single step card with node name, status dot, and JSON body */
function StepCard({ step, type }: { step: any; type: 'input' | 'output' }) {
    const nodeLabel = String(step.node?.data?.label || step.node?.type || 'Node');
    const nodeType = String(step.node?.type || '');
    const payload = type === 'input' ? step.inputData : step.outputData ?? step.data?.data ?? step.data;

    const statusClass =
        step.status === 'running' ? 'active' :
        step.status === 'success' ? 'success' :
        step.status === 'error' ? 'error' : '';

    return (
        <div className={`exec-step-card ${statusClass ? `exec-step-card--${statusClass}` : ''}`}>
            <div className="exec-step-card__header">
                <span className={`exec-step-card__status-dot exec-step-card__status-dot--${step.status}`} />
                <span className="exec-step-card__node-name">{nodeLabel}</span>
                <span className="exec-step-card__node-type">{nodeType}</span>
            </div>
            <div className="exec-step-card__body">
                {step.message && (
                    <div className="exec-step-card__message">{step.message}</div>
                )}
                {payload && typeof payload === 'object' && Object.keys(payload).length > 0 ? (
                    <pre className="exec-step-card__json">
                        {JSON.stringify(payload, null, 2)}
                    </pre>
                ) : payload && typeof payload === 'string' ? (
                    <pre className="exec-step-card__json">{payload}</pre>
                ) : (
                    <span className="exec-step-card__empty">
                        {step.status === 'running' ? 'Awaiting response...' : 'No data available'}
                    </span>
                )}
            </div>
        </div>
    );
}

/** The inner component that uses React Flow hooks (must be inside ReactFlowProvider) */
function DebuggerCanvasInner({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
    const { steps, isExecuting, isSimulationDone } = useExecution();
    const nodeTypes = useMemo(() => NODE_TYPES, []);
    const edgeTypes = useMemo(() => EDGE_TYPES, []);

    // Transform nodes with execution status — same logic as SkillDesignerCanvas
    const displayNodes = useMemo(() => {
        if (!isExecuting && !isSimulationDone) return nodes;

        return nodes.map(node => {
            const matchingSteps = steps.filter((step) => step.node.id === node.id && step.status !== 'idle');
            const step = matchingSteps[matchingSteps.length - 1];

            if (!step) {
                return {
                    ...node,
                    style: { ...node.style, opacity: 0.25 }
                } as CanvasNode;
            }

            return {
                ...node,
                data: {
                    ...node.data,
                    executionStatus: step.status
                }
            } as CanvasNode;
        });
    }, [nodes, steps, isExecuting, isSimulationDone]);

    // Transform edges with execution status — same logic as SkillDesignerCanvas
    const displayEdges = useMemo(() => {
        if (!isExecuting && !isSimulationDone) return edges;

        const revealedSteps = steps.filter((step) => step.status !== 'idle');

        return edges.map(edge => {
            let isPathActive = false;
            let status = 'idle';

            for (let i = 0; i < revealedSteps.length - 1; i++) {
                if (revealedSteps[i].node.id === edge.source && revealedSteps[i + 1].node.id === edge.target) {
                    isPathActive = true;
                    status = revealedSteps[i + 1].status;
                    break;
                }
            }

            if (!isPathActive) {
                return {
                    ...edge,
                    animated: false,
                    style: { ...edge.style, stroke: 'var(--color-border)', opacity: 0.3 }
                };
            }

            if (status === 'running') {
                return {
                    ...edge,
                    animated: true,
                    style: { ...edge.style, stroke: 'var(--color-primary)', strokeWidth: 3, opacity: 1, filter: 'drop-shadow(0 0 4px var(--color-primary))' }
                };
            } else if (status === 'success') {
                return {
                    ...edge,
                    animated: false,
                    style: { ...edge.style, stroke: 'var(--color-success)', strokeWidth: 3, opacity: 1 }
                };
            } else if (status === 'error') {
                return {
                    ...edge,
                    animated: false,
                    style: { ...edge.style, stroke: 'var(--color-error)', strokeWidth: 3, opacity: 1 }
                };
            }

            return edge;
        });
    }, [edges, steps, isExecuting, isSimulationDone]);

    return (
        <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={true}
            zoomOnScroll={true}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 0.85 }}
            proOptions={{ hideAttribution: true }}
        >
            <Background color="var(--text-muted)" variant={BackgroundVariant.Dots} gap={20} size={1.5} />
        </ReactFlow>
    );
}

export default function ExecutionDebuggerModal({ isOpen, onClose, nodes, edges }: ExecutionDebuggerModalProps) {
    const { steps, isExecuting, isSimulationDone, resetStepper } = useExecution();
    const inputScrollRef = useRef<HTMLDivElement>(null);
    const outputScrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll panes as new cards appear
    useEffect(() => {
        if (inputScrollRef.current) {
            inputScrollRef.current.scrollTop = inputScrollRef.current.scrollHeight;
        }
    }, [steps]);

    useEffect(() => {
        if (outputScrollRef.current) {
            outputScrollRef.current.scrollTop = outputScrollRef.current.scrollHeight;
        }
    }, [steps]);

    const handleClose = () => {
        resetStepper();
        onClose();
    };

    // Steps that have started (running, success, error) — for input pane
    const activeSteps = useMemo(() =>
        steps.filter(s => s.status !== 'idle'),
    [steps]);

    // Steps that have completed — for output pane
    const completedSteps = useMemo(() =>
        steps.filter(s => s.status === 'success' || s.status === 'error'),
    [steps]);

    // Header badge
    const statusBadge = useMemo(() => {
        if (isExecuting) {
            return { label: 'Executing...', className: 'exec-debugger-header__badge--running', icon: <Loader2 size={12} className="spin-icon" /> };
        }
        const hasError = steps.some(s => s.status === 'error');
        if (isSimulationDone && hasError) {
            return { label: 'Failed', className: 'exec-debugger-header__badge--error', icon: <XCircle size={12} /> };
        }
        if (isSimulationDone) {
            return { label: 'Completed', className: 'exec-debugger-header__badge--done', icon: <CheckCircle2 size={12} /> };
        }
        return { label: 'Initializing...', className: 'exec-debugger-header__badge--running', icon: <Loader2 size={12} className="spin-icon" /> };
    }, [isExecuting, isSimulationDone, steps]);

    if (!isOpen) return null;

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            closable={false}
            centered
            destroyOnHidden
            width="calc(100vw - 32px)"
            className="exec-debugger-modal-shell"
            style={{ top: 16, maxWidth: 'none', paddingBottom: 0 }}
        >
            <div className="exec-debugger-modal">
                {/* ── Header ── */}
                <div className="exec-debugger-header">
                    <div className="exec-debugger-header__title">
                        <Zap size={18} className="exec-debugger-header__title-icon" />
                        Workflow Execution
                    </div>
                    <div className="exec-debugger-header__status">
                        <span className={`exec-debugger-header__badge ${statusBadge.className}`}>
                            {statusBadge.icon}
                            {statusBadge.label}
                        </span>
                        <button className="exec-debugger-header__close-btn" onClick={handleClose} title="Close">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ── Body — Three Panes ── */}
                <div className="exec-debugger-body">
                    {/* Left: Mini Canvas */}
                    <div className="exec-debugger-canvas">
                        <ReactFlowProvider>
                            <DebuggerCanvasInner nodes={nodes} edges={edges} />
                        </ReactFlowProvider>
                    </div>

                    {/* Middle: Input Data */}
                    <div className="exec-debugger-pane">
                        <div className="exec-debugger-pane__header">
                            <LogIn size={16} className="exec-debugger-pane__header-icon exec-debugger-pane__header-icon--input" />
                            Input
                        </div>
                        <div className="exec-debugger-pane__scroll" ref={inputScrollRef}>
                            {activeSteps.length > 0 ? (
                                activeSteps.map((step, idx) => (
                                    <StepCard key={`input-${step.node.id}-${idx}`} step={step} type="input" />
                                ))
                            ) : (
                                <div className="exec-debugger-pane__empty">
                                    <LogIn size={32} className="exec-debugger-pane__empty-icon" />
                                    Waiting for execution to begin...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Output Data */}
                    <div className="exec-debugger-pane">
                        <div className="exec-debugger-pane__header">
                            <LogOut size={16} className="exec-debugger-pane__header-icon exec-debugger-pane__header-icon--output" />
                            Output
                        </div>
                        <div className="exec-debugger-pane__scroll" ref={outputScrollRef}>
                            {completedSteps.length > 0 ? (
                                completedSteps.map((step, idx) => (
                                    <StepCard key={`output-${step.node.id}-${idx}`} step={step} type="output" />
                                ))
                            ) : (
                                <div className="exec-debugger-pane__empty">
                                    <LogOut size={32} className="exec-debugger-pane__empty-icon" />
                                    Output will appear as nodes complete...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
