/**
 * ExecutionDebuggerModal — Full-screen three-pane execution visualization.
 * Left:   Mini React Flow canvas with live execution animations
 * Middle: Input data per node (progressive reveal)
 * Right:  Output data per node (progressive reveal)
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import { Modal, Skeleton } from 'antd';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Zap, LogIn, LogOut, X, Loader2, CheckCircle2, XCircle, Maximize2, Minimize2 } from 'lucide-react';
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
function DebuggerCanvasInner({ nodes, edges, panelWidthToggle }: DebuggerCanvasInnerProps & { panelWidthToggle?: number }) {
    const { steps, isExecuting, isSimulationDone, activeStepIndex } = useExecution();
    const { fitView, setCenter, getZoom } = useReactFlow();
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

    // Smart Viewport Sync: Refit smoothly when panels are fully resized or initialized.
    useEffect(() => {
        // slight delay to let DOM settle after resize
        const timeout = setTimeout(() => {
            fitView({ duration: 600, padding: 0.3, maxZoom: 0.85 });
        }, 50);
        return () => clearTimeout(timeout);
    }, [panelWidthToggle, fitView]);

    // Smart Viewport Sync: Follow the active node
    useEffect(() => {
        if (activeStepIndex >= 0 && activeStepIndex < steps.length) {
            const activeNodeId = steps[activeStepIndex].node.id;
            const activeNode = displayNodes.find(n => n.id === activeNodeId);
            
            if (activeNode && activeNode.position) {
                // Determine node center (approximate width 250px, height 80px based on standard nodes)
                const nodeX = activeNode.position.x + 125; 
                const nodeY = activeNode.position.y + 40;
                
                // Pan smoothly to center the node, keeping current zoom or zooming in slightly
                const currentZoom = getZoom();
                setCenter(nodeX, nodeY, { zoom: Math.max(currentZoom, 0.7), duration: 800 });
            }
        }
    }, [activeStepIndex, displayNodes, setCenter, getZoom, steps]);

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
    const { steps, isExecuting, isFetching, isSimulationDone, globalLogs, resetStepper } = useExecution();
    const timelineScrollRef = useRef<HTMLDivElement>(null);
    
    // Resizer State
    const [ioWidth, setIoWidth] = useState(550); // Default 550px for the IO pane
    const [isDragging, setIsDragging] = useState(false);

    // Tab State
    const [activeIoTab, setActiveIoTab] = useState<'node' | 'log'>('node');
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Auto-scroll timeline as new cards appear
    useEffect(() => {
        if (timelineScrollRef.current) {
            timelineScrollRef.current.scrollTop = timelineScrollRef.current.scrollHeight;
        }
    }, [steps]);

    // Cleanup drag listeners
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            // Calculate new width: distance from right edge
            const newWidth = window.innerWidth - e.clientX;
            // Enforce min/max constraints (min 300px, max 60% of viewport)
            const clampedWidth = Math.max(300, Math.min(newWidth, window.innerWidth * 0.6));
            setIoWidth(clampedWidth);
        };

        const handleMouseUp = () => {
            if (isDragging) setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

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
            rootClassName={`exec-debugger-modal-root ${isFullScreen ? 'exec-debugger-modal-root--fullscreen' : ''}`}
            classNames={{
                wrapper: 'exec-debugger-modal-wrapper',
                container: 'exec-debugger-modal-container',
                body: 'exec-debugger-modal-ant-body',
            }}
        >
            <div className={`exec-debugger-modal ${isDragging ? 'is-dragging' : ''}`}>
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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="exec-debugger-header__close-btn" onClick={() => setIsFullScreen(!isFullScreen)} title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
                                {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                            </button>
                            <button className="exec-debugger-header__close-btn" onClick={handleClose} title="Close">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Body — Three Panes ── */}
                <div className="exec-debugger-body">
                    {/* Left: Mini Canvas (flex-grow fills the rest) */}
                    <div className="exec-debugger-canvas" style={{ flex: 1 }}>
                        <ReactFlowProvider>
                            <DebuggerCanvasInner nodes={nodes} edges={edges} panelWidthToggle={isDragging ? 0 : ioWidth} />
                        </ReactFlowProvider>
                    </div>

                    {/* Resizer Handle */}
                    <div 
                        className="exec-debugger-resizer" 
                        onMouseDown={() => setIsDragging(true)}
                        title="Drag to resize"
                        aria-hidden="true"
                    >
                        <div className="exec-debugger-resizer-line" />
                    </div>

                    {/* Middle + Right: Aligned Input / Output Timeline */}
                    <div className="exec-debugger-io" style={{ width: `${ioWidth}px`, flex: `0 0 ${ioWidth}px` }}>
                        
                        {/* ── IO Tabs ── */}
                        <div className="exec-debugger-io__tabs">
                            <button 
                                className={`exec-debugger-io-tab ${activeIoTab === 'node' ? 'exec-debugger-io-tab--active' : ''}`}
                                onClick={() => setActiveIoTab('node')}
                            >
                                Action Monitor
                            </button>
                            <button 
                                className={`exec-debugger-io-tab ${activeIoTab === 'log' ? 'exec-debugger-io-tab--active' : ''}`}
                                onClick={() => setActiveIoTab('log')}
                            >
                                Monitor Log
                            </button>
                        </div>

                        {/* ── Content Area ── */}
                        {activeIoTab === 'node' ? (
                            <>
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
                            </>
                        ) : (
                            <div className="exec-debugger-log-container">
                                {globalLogs && globalLogs.length > 0 ? (
                                    globalLogs.map((log, i) => (
                                        <div key={i} className="exec-debugger-log-line">{log}</div>
                                    ))
                                ) : (
                                    <div className="exec-debugger-pane__empty">
                                        No logs captured for this execution.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
