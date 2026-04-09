import React from 'react';
import { Typography, Empty, Progress } from 'antd';
import type { ExecutionOutputsLogsPaneProps } from '@/interfaces';

const { Text } = Typography;

export const ExecutionOutputsLogsPane: React.FC<ExecutionOutputsLogsPaneProps> = ({ 
    completedStepsList, 
    outputContainerRef, 
    isSimulationDone, 
    isExecuting, 
    activeStepIndex, 
    steps, 
    globalLogs
}) => {
    const renderOutput = (data: any) => JSON.stringify(data || { _hint: "No Data Output" }, null, 2);

    return (
        <div className="execution-modal__pane execution-modal__pane--right">
            <div className="execution-modal__pane-split execution-modal__pane-split--top">
                <div className="execution-modal__pane-header">
                    <Text strong>Execution Outputs</Text>
                </div>
                <div className="execution-modal__pane-content" ref={outputContainerRef}>
                    {completedStepsList.length === 0 ? (
                        <Empty description="Waiting for outputs..." className="execution-modal__empty" />
                    ) : (
                        <div>
                            {completedStepsList.map((step) => (
                                <div key={step.node.id} className="execution-modal__step-item">
                                    <Text type="secondary" strong className="execution-modal__step-label">
                                        {(step.node.data as any)?.label || step.node.id}
                                    </Text>
                                    <pre className="execution-modal__code-viewer">
                                        {`${renderOutput(step.data)}`}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* <div className="execution-modal__pane-split execution-modal__pane-split--bottom">
                <div className="execution-modal__pane-header">
                    <Text strong>System Logs</Text>
                </div>
                <div className="execution-modal__pane-content execution-modal__pane-content--logs">
                    {!isSimulationDone && isExecuting ? (
                        <div className="execution-modal__progress-container">
                            <Progress
                                type="dashboard"
                                percent={steps.length > 0 ? Math.round(((activeStepIndex + 1) / steps.length) * 100) : 0}
                                status="active"
                                format={(percent) => <span>{percent}%</span>}
                            />
                            <Text className="execution-modal__progress-text">Executing Step {activeStepIndex + 1} of {steps.length}</Text>
                        </div>
                    ) : (
                        globalLogs.length > 0 ? (
                            <pre className="execution-modal__logs-viewer">
                                {globalLogs.join('\n')}
                            </pre>
                        ) : (
                            <div className="execution-modal__centered-content">
                                <Empty description="Waiting for logs..." className="execution-modal__empty" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </div>
                        )
                    )}
                </div>
            </div> */}
        </div>
    );
};
