/**
 * CreateActionExecutionStep — Step 3: Configure execution settings.
 */

import { Form, Input, InputNumber, Select, Typography } from 'antd';
import type { CreateActionStepProps } from '@/interfaces';
import type { ActionExecutionConfig } from '@/interfaces';
import { CONNECTOR_OPTIONS, HTTP_METHOD_OPTIONS, DEFAULT_EXECUTION_CONFIG } from '@/constants';
import './CreateActionExecutionStep.css';

const { Title, Text } = Typography;

export default function CreateActionExecutionStep({ draft, setDraft }: CreateActionStepProps) {
    const config: ActionExecutionConfig = draft.executionJson ?? DEFAULT_EXECUTION_CONFIG;

    const updateConfig = (field: keyof ActionExecutionConfig, value: unknown) => {
        setDraft(prev => ({
            ...prev,
            executionJson: { ...config, [field]: value },
        }));
    };

    return (
        <div className="action-execution-step">
            <div className="action-execution-step__header">
                <Title level={5} style={{ margin: 0 }}>Execution Configuration</Title>
                <Text type="secondary">
                    Define how this action connects to its underlying service or endpoint.
                </Text>
            </div>

            <Form layout="vertical" className="action-execution-step__form">
                <Form.Item label="Connector Type">
                    <Select
                        value={config.connectorType}
                        onChange={(val) => updateConfig('connectorType', val)}
                        options={CONNECTOR_OPTIONS}
                    />
                </Form.Item>

                {config.connectorType !== 'none' && config.connectorType !== 'internal' && (
                    <>
                        <Form.Item label="Endpoint URL">
                            <Input
                                placeholder="https://api.example.com/v1/action"
                                value={config.endpointUrl}
                                onChange={(e) => updateConfig('endpointUrl', e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item label="HTTP Method">
                            <Select
                                value={config.httpMethod}
                                onChange={(val) => updateConfig('httpMethod', val)}
                                options={HTTP_METHOD_OPTIONS}
                            />
                        </Form.Item>
                    </>
                )}

                <div className="action-execution-step__row">
                    <Form.Item label="Timeout (ms)" className="action-execution-step__field">
                        <InputNumber
                            value={config.timeoutMs}
                            onChange={(val) => updateConfig('timeoutMs', val ?? 30000)}
                            min={1000}
                            max={300000}
                            step={1000}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Retry Count" className="action-execution-step__field">
                        <InputNumber
                            value={config.retryCount}
                            onChange={(val) => updateConfig('retryCount', val ?? 0)}
                            min={0}
                            max={10}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Retry Delay (ms)" className="action-execution-step__field">
                        <InputNumber
                            value={config.retryDelayMs}
                            onChange={(val) => updateConfig('retryDelayMs', val ?? 1000)}
                            min={100}
                            max={60000}
                            step={500}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </div>
            </Form>
        </div>
    );
}
