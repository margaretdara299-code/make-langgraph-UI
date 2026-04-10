import { Modal, Typography, theme, Spin, Button, Tooltip, Input, message } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { ReloadOutlined, PlayCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useExecutionStepper } from '@/hooks';
import type { ExecutionDebuggerModalProps } from '@/interfaces';
import './ExecutionDebuggerModal.css';

import { ExecutionInputsPane } from './subcomponents/ExecutionInputsPane';
import { ExecutionStepperPane } from './subcomponents/ExecutionStepperPane';
import { ExecutionOutputsLogsPane } from './subcomponents/ExecutionOutputsLogsPane';

const { Text, Title } = Typography;

export default function ExecutionDebuggerModal({ isOpen, onClose, versionId, nodes, edges }: ExecutionDebuggerModalProps) {
    const { token } = theme.useToken();
    const {
        isExecuting,
        isFetching,
        isSimulationDone,
        globalLogs,
        steps,
        activeStepIndex,
        runExecution,
        stopExecution,
        resetStepper
    } = useExecutionStepper();

    const [selectedStepIndex, setSelectedStepIndex] = useState<number>(-1);

    // Initial Data state for execution inputs
    const [hasStarted, setHasStarted] = useState(false);
    const [initialDataStr, setInitialDataStr] = useState<string>('{\n  "case_id": "1",\n  "claim_id": "123"\n}');

    // Changing Loader Texts
    const [loaderTextIndex, setLoaderTextIndex] = useState(0);
    const loaderTexts = ["Starting...", "Executing...", "Almost there..."];

    useEffect(() => {
        if (isFetching) {
            setLoaderTextIndex(0);
            const interval = setInterval(() => {
                setLoaderTextIndex(prev => Math.min(prev + 1, loaderTexts.length - 1));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isFetching]);

    // Auto-scroll for Inputs
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const activeOrCompletedSteps = steps.filter((_, idx) => idx <= activeStepIndex);

    useEffect(() => {
        if (inputContainerRef.current) {
            inputContainerRef.current.scrollTop = inputContainerRef.current.scrollHeight;
        }
    }, [activeOrCompletedSteps.length]);

    // Auto-scroll for Outputs
    const outputContainerRef = useRef<HTMLDivElement>(null);
    const completedStepsList = steps.filter(s => s.status === 'success' || s.status === 'error');

    useEffect(() => {
        if (outputContainerRef.current) {
            outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
        }
    }, [completedStepsList.length]);

    useEffect(() => {
        if (!isOpen) {
            resetStepper();
            setSelectedStepIndex(-1);
            setHasStarted(false);
        }
    }, [isOpen, resetStepper]);

    useEffect(() => {
        if (activeStepIndex >= 0) {
            setSelectedStepIndex(activeStepIndex);
        }
    }, [activeStepIndex]);

    const handleClose = () => {
        stopExecution();
        onClose();
        setHasStarted(false);
    };

    const handleStart = () => {
        let parsed = {};
        try {
            parsed = JSON.parse(initialDataStr);
        } catch (e) {
            message.error("Invalid JSON input");
            return;
        }
        setHasStarted(true);
        runExecution(versionId, nodes, edges, parsed);
    };

    const handleReRun = () => {
        let parsed = {};
        try { parsed = JSON.parse(initialDataStr); } catch (e) {}
        runExecution(versionId, nodes, edges, parsed);
    };

    return (
        <Modal
            title={
                <div className="execution-modal__header">
                    <Title level={4} style={{ margin: 0 }}>Workflow Execution Debugger</Title>
                    {isExecuting && !isFetching ? (
                        <Spin className="execution-modal__header-spin" />
                    ) : hasStarted ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Tooltip title="Edit Inputs & Restart">
                                <Button type="text" icon={<EditOutlined />} onClick={() => setHasStarted(false)} disabled={isFetching} />
                            </Tooltip>
                            <Tooltip title="Re-Run Workflow">
                                <Button type="text" icon={<ReloadOutlined />} onClick={handleReRun} disabled={isFetching} />
                            </Tooltip>
                        </div>
                    ) : null}
                </div>
            }
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            width="95vw"
            centered
            className="execution-modal"
            zIndex={2000}
            styles={{
                mask: {
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(0, 0, 0, 0.45)'
                },
                body: { padding: 0 }
            }}
        >
            <div className="execution-modal__layout" style={{ background: token.colorBgLayout }}>
                {!hasStarted ? (
                    <div style={{ padding: '2rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Title level={4}>Provide Initial Input Data (JSON)</Title>
                        <Text type="secondary" style={{ marginBottom: '1rem', textAlign: 'center', maxWidth: '600px' }}>
                            Pass initial contextual data into the workflow run. This simulates external events providing state to the Workflow Entry node.
                        </Text>
                        <Input.TextArea 
                            value={initialDataStr} 
                            onChange={(e) => setInitialDataStr(e.target.value)} 
                            rows={15} 
                            style={{ width: '80%', maxWidth: '800px', fontFamily: 'monospace', marginBottom: '1.5rem', fontSize: '14px', padding: '1rem', borderRadius: '8px' }} 
                        />
                        <Button type="primary" size="large" onClick={handleStart} icon={<PlayCircleOutlined />}>Start Execution</Button>
                    </div>
                ) : isFetching ? (
                    <div className="reactor-loader-container">
                        <div className="reactor-loader">
                            <div className="reactor-core"></div>
                            <div className="reactor-ring"></div>
                            <div className="reactor-ring reactor-ring--inner"></div>
                        </div>
                        <Text type="secondary" style={{ fontSize: '1.2rem', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', transition: 'all 0.3s ease' }}>
                            {loaderTexts[loaderTextIndex]}
                        </Text>
                    </div>
                ) : (
                    <>
                        <ExecutionInputsPane 
                            activeOrCompletedSteps={activeOrCompletedSteps}
                            inputContainerRef={inputContainerRef}
                        />

                        <ExecutionStepperPane 
                            steps={steps}
                            activeStepIndex={activeStepIndex}
                            setSelectedStepIndex={setSelectedStepIndex}
                        />

                        <ExecutionOutputsLogsPane 
                            completedStepsList={completedStepsList}
                            outputContainerRef={outputContainerRef}
                            isSimulationDone={isSimulationDone}
                            isExecuting={isExecuting}
                            activeStepIndex={activeStepIndex}
                            steps={steps}
                            globalLogs={globalLogs}
                        />
                    </>
                )}
            </div>
        </Modal>
    );
}
