import type { CSSProperties } from 'react';
import { Modal } from 'antd';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Zap, LogIn, LogOut, X, Loader2, CheckCircle2, XCircle, Maximize2, Minimize2 } from 'lucide-react';
import type { ExecutionDebuggerBadgeIconMap, ExecutionDebuggerModalProps } from '@/interfaces';
import { EXECUTION_DEBUGGER_PLACEHOLDER_ROWS, hasRenderablePayload } from '@/utils';
import { DebuggerCanvasInner } from './DebuggerCanvasInner';
import { StepCard, StepCardSkeleton } from './StepCard';
import { useExecutionDebugger } from './useExecutionDebugger.hook';
import './ExecutionDebuggerModal.css';

const BADGE_ICONS: ExecutionDebuggerBadgeIconMap = {
    loading: <Loader2 size={12} className="spin-icon" />,
    success: <CheckCircle2 size={12} />,
    error: <XCircle size={12} />,
};

export default function ExecutionDebuggerModal({ isOpen, onClose, nodes, edges }: ExecutionDebuggerModalProps) {
    const {
        isFetching,
        globalLogs,
        timelineScrollRef,
        ioWidth,
        isDragging,
        setIsDragging,
        activeIoTab,
        setActiveIoTab,
        isFullScreen,
        setIsFullScreen,
        handleClose,
        activeSteps,
        statusBadge,
    } = useExecutionDebugger(onClose);

    if (!isOpen) return null;

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            closable={false}
            destroyOnHidden
            zIndex={2000}
            rootClassName={`exec-debugger-modal-root ${isFullScreen ? 'exec-debugger-modal-root--fullscreen' : ''}`}
            classNames={{
                wrapper: 'exec-debugger-modal-wrapper',
                container: 'exec-debugger-modal-container',
                body: 'exec-debugger-modal-ant-body',
            }}
        >
            <div
                className={`exec-debugger-modal ${isDragging ? 'is-dragging' : ''}`}
                style={{ '--io-width': `${ioWidth}px` } as CSSProperties}
            >
                {/* ── Header ── */}
                <div className="exec-debugger-header">
                    <div className="exec-debugger-header__title">
                        <Zap size={18} className="exec-debugger-header__title-icon" />
                        Workflow Execution
                    </div>
                    <div className="exec-debugger-header__status">
                        <span className={`exec-debugger-header__badge ${statusBadge.className}`}>
                            {BADGE_ICONS[statusBadge.icon]}
                            {statusBadge.label}
                        </span>
                        <div className="edm-header-actions">
                            <button
                                className="exec-debugger-header__close-btn"
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                            >
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
                    <div className="exec-debugger-canvas edm-canvas-inner">
                        <ReactFlowProvider>
                            <DebuggerCanvasInner nodes={nodes} edges={edges} panelWidthToggle={isDragging ? 0 : ioWidth} />
                        </ReactFlowProvider>
                    </div>

                    <div
                        className="exec-debugger-resizer"
                        onMouseDown={() => setIsDragging(true)}
                        title="Drag to resize"
                        aria-hidden="true"
                    >
                        <div className="exec-debugger-resizer-line" />
                    </div>

                    <div className="exec-debugger-io">
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
