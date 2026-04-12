import React from 'react';
import { Typography, Empty, Steps } from 'antd';
import type { ExecutionStepperPaneProps } from '@/interfaces';

const { Text } = Typography;

export const ExecutionStepperPane: React.FC<ExecutionStepperPaneProps> = ({ 
    steps, 
    activeStepIndex, 
    setSelectedStepIndex
}) => {
    return (
        <div className="execution-modal__pane execution-modal__pane--middle">
            <div className="execution-modal__pane-header">
                <Text strong>Execution Path</Text>
            </div>
            <div className="execution-modal__pane-content execution-modal__stepper-container">
                {steps.length === 0 ? (
                    <Empty description="No execution steps found." className="execution-modal__empty" />
                ) : (
                    <Steps
                        direction="vertical"
                        current={activeStepIndex >= 0 ? activeStepIndex : undefined}
                        onChange={(current) => setSelectedStepIndex(current)}
                        items={steps.map((step) => {
                            const nodeData = step.node.data as any;
                            let status: 'wait' | 'process' | 'finish' | 'error' = 'wait';
                            if (step.status === 'running') status = 'process';
                            if (step.status === 'success') status = 'finish';
                            if (step.status === 'error') status = 'error';

                            const title = nodeData?.label || step.node.id;
                            const description = nodeData?.capability ? `Capability: ${nodeData.capability}` : undefined;

                            return {
                                title,
                                description,
                                status,
                            };
                        })}
                    />
                )}
            </div>
        </div>
    );
};
