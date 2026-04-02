import { Modal, Typography, theme, Spin, Button, Tooltip } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
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
        if (isOpen && versionId) {
            runExecution(versionId, nodes, edges);
        } else {
            resetStepper();
            setSelectedStepIndex(-1);
        }
    }, [isOpen, versionId, nodes, edges, runExecution, resetStepper]);

    useEffect(() => {
        if (activeStepIndex >= 0) {
            setSelectedStepIndex(activeStepIndex);
        }
    }, [activeStepIndex]);

    const handleClose = () => {
        stopExecution();
        onClose();
    };

    const handleReRun = () => {
        runExecution(versionId, nodes, edges);
    };

    return (
        <Modal
            title={
                <div className="execution-modal__header">
                    <Title level={4} style={{ margin: 0 }}>Workflow Execution Debugger</Title>
                    {isExecuting && !isFetching ? (
                        <Spin className="execution-modal__header-spin" />
                    ) : (
                        <Tooltip title="Re-Run Workflow">
                            <Button type="text" icon={<ReloadOutlined />} onClick={handleReRun} disabled={isFetching} />
                        </Tooltip>
                    )}
                </div>
            }
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            width="95vw"
            centered
            className="execution-modal"
            styles={{
                body: { padding: 0 }
            }}
        >
            <div className="execution-modal__layout" style={{ background: token.colorBgLayout }}>
                {isFetching ? (
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
