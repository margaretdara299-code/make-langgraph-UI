/**
 * ExecutionDebuggerModal — Full-screen three-pane execution visualization.
 * Left:   Mini React Flow canvas with live execution animations
 * Middle: Input data per node (progressive reveal)
 * Right:  Output data per node (progressive reveal)
 */

import { useMemo, useRef, useEffect } from 'react';
import { Modal, Skeleton } from 'antd';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Zap, LogIn, LogOut, X, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { NODE_TYPES, EDGE_TYPES } from '@/constants';
import { useExecution } from '@/contexts';
import type {
    DebuggerCanvasInnerProps,
    ExecutionDebuggerBadgeIconMap,
    ExecutionDebuggerModalProps,
    ExecutionDebuggerStepCardProps,
    ExecutionDebuggerStepCardSkeletonProps,
} from '@/interfaces';
import {
    buildExecutionDebuggerEdges,
    buildExecutionDebuggerNodes,
    EXECUTION_DEBUGGER_PLACEHOLDER_ROWS,
    getActiveExecutionSteps,
    getExecutionStatusBadge,
    getExecutionStepNodeLabel,
    getExecutionStepNodeType,
    getExecutionStepPayload,
    getStepCardStatusClass,
    hasRenderablePayload,
} from '@/utils';

import './ExecutionDebuggerModal.css';

/** Renders a single step card with node name, status dot, and JSON body */
function StepCard({ step, type, isLoading = false }: ExecutionDebuggerStepCardProps) {
    const nodeLabel = getExecutionStepNodeLabel(step);
    const nodeType = getExecutionStepNodeType(step);
    const payload = getExecutionStepPayload(step, type);
    const statusClass = getStepCardStatusClass(step.status);

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
                {isLoading ? (
                    <div className="exec-step-card__skeleton">
                        <Skeleton
                            active
                            title={{ width: '42%' }}
                            paragraph={{ rows: 4, width: ['100%', '96%', '92%', '84%'] }}
                        />
                    </div>
                ) : hasRenderablePayload(payload) && typeof payload === 'object' ? (
                    <pre className="exec-step-card__json">
                        {JSON.stringify(payload, null, 2)}
                    </pre>
                ) : hasRenderablePayload(payload) && typeof payload === 'string' ? (
                    <pre className="exec-step-card__json">{payload}</pre>
                ) : (
                    <span className="exec-step-card__empty">
                        {type === 'output' && step.status === 'running' ? 'Output will appear when this node completes...' : 'No data available'}
                    </span>
                )}
            </div>
        </div>
    );
}

function StepCardSkeleton({ type }: ExecutionDebuggerStepCardSkeletonProps) {
    return (
        <div className="exec-step-card exec-step-card--loading">
            <div className="exec-step-card__header">
                <span className="exec-step-card__status-dot exec-step-card__status-dot--idle" />
                <span className="exec-step-card__node-name">Loading {type}...</span>
                <span className="exec-step-card__node-type">{type}</span>
            </div>
            <div className="exec-step-card__body">
                <div className="exec-step-card__skeleton">
                    <Skeleton
                        active
                        title={{ width: type === 'input' ? '46%' : '52%' }}
                        paragraph={{ rows: 5, width: ['100%', '96%', '92%', '88%', '82%'] }}
                    />
                </div>
            </div>
        </div>
    );
}

/** The inner component that uses React Flow hooks (must be inside ReactFlowProvider) */
function DebuggerCanvasInner({ nodes, edges }: DebuggerCanvasInnerProps) {
    const { steps, isExecuting, isSimulationDone } = useExecution();
    const nodeTypes = useMemo(() => NODE_TYPES, []);
    const edgeTypes = useMemo(() => EDGE_TYPES, []);

    const displayNodes = useMemo(
        () => buildExecutionDebuggerNodes(nodes, steps, isExecuting, isSimulationDone),
        [nodes, steps, isExecuting, isSimulationDone]
    );

    const displayEdges = useMemo(
        () => buildExecutionDebuggerEdges(edges, steps, isExecuting, isSimulationDone),
        [edges, steps, isExecuting, isSimulationDone]
    );

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
    const { steps, isExecuting, isFetching, isSimulationDone, resetStepper } = useExecution();
    const timelineScrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll timeline as new cards appear
    useEffect(() => {
        if (timelineScrollRef.current) {
            timelineScrollRef.current.scrollTop = timelineScrollRef.current.scrollHeight;
        }
    }, [steps]);

    const handleClose = () => {
        resetStepper();
        onClose();
    };

    const activeSteps = useMemo(() => getActiveExecutionSteps(steps), [steps]);

    const badgeIcons = useMemo<ExecutionDebuggerBadgeIconMap>(() => ({
        loading: <Loader2 size={12} className="spin-icon" />,
        success: <CheckCircle2 size={12} />,
        error: <XCircle size={12} />,
    }), []);

    const statusBadge = useMemo(
        () => getExecutionStatusBadge(isExecuting, isSimulationDone, steps),
        [isExecuting, isSimulationDone, steps]
    );

    if (!isOpen) return null;

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            closable={false}
            destroyOnHidden
            rootClassName="exec-debugger-modal-root"
            classNames={{
                wrapper: 'exec-debugger-modal-wrapper',
                container: 'exec-debugger-modal-container',
                body: 'exec-debugger-modal-ant-body',
            }}
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
                            {badgeIcons[statusBadge.icon]}
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

                    {/* Middle + Right: Aligned Input / Output Timeline */}
                    <div className="exec-debugger-io">
                        <div className="exec-debugger-io__headers">
                            <div className="exec-debugger-pane__header exec-debugger-pane__header--io">
                                <LogIn size={16} className="exec-debugger-pane__header-icon exec-debugger-pane__header-icon--input" />
                                Input
                            </div>
                            <div className="exec-debugger-pane__header exec-debugger-pane__header--io">
                                <LogOut size={16} className="exec-debugger-pane__header-icon exec-debugger-pane__header-icon--output" />
                                Output
                            </div>
                        </div>
                        <div className="exec-debugger-io__scroll" ref={timelineScrollRef}>
                            {isFetching && activeSteps.length === 0 ? (
                                EXECUTION_DEBUGGER_PLACEHOLDER_ROWS.map((idx) => (
                                    <div className="exec-debugger-row" key={`loading-${idx}`}>
                                        <StepCardSkeleton type="input" />
                                        <StepCardSkeleton type="output" />
                                    </div>
                                ))
                            ) : activeSteps.length > 0 ? (
                                activeSteps.map((step, idx) => (
                                    <div className="exec-debugger-row" key={`row-${step.node.id}-${idx}`}>
                                        <StepCard
                                            step={step}
                                            type="input"
                                            isLoading={step.status === 'running' && !hasRenderablePayload(step.inputData)}
                                        />
                                        <StepCard
                                            step={step}
                                            type="output"
                                            isLoading={step.status === 'running'}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="exec-debugger-pane__empty">
                                    <LogIn size={32} className="exec-debugger-pane__empty-icon" />
                                    Waiting for execution to begin...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
