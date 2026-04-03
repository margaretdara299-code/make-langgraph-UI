import React from 'react';
import { Typography, Empty } from 'antd';
import type { ExecutionInputsPaneProps } from '@/interfaces';

const { Text } = Typography;

export const ExecutionInputsPane: React.FC<ExecutionInputsPaneProps> = ({ 
    activeOrCompletedSteps, 
    inputContainerRef
}) => {
    const renderInput = (data: any) => JSON.stringify(data || { _hint: "Input payload currently not provided by backend" }, null, 2);

    return (
        <div className="execution-modal__pane execution-modal__pane--left">
            <div className="execution-modal__pane-header">
                <Text strong>Execution Inputs</Text>
            </div>
            <div className="execution-modal__pane-content" ref={inputContainerRef}>
                {activeOrCompletedSteps.length === 0 ? (
                    <Empty description="Waiting for inputs..." className="execution-modal__empty" />
                ) : (
                    <div>
                        {activeOrCompletedSteps.map((step) => (
                            <div key={step.node.id} className="execution-modal__step-item">
                                <Text type="secondary" strong className="execution-modal__step-label">
                                    {(step.node.data as any)?.label || step.node.id}
                                </Text>
                                <pre className="execution-modal__code-viewer">
                                    {`${renderInput(step.inputData)}`}
                                </pre>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
