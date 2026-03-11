/**
 * CreateActionReviewStep — Step 7: Read-only summary of all configured steps.
 */

import { Typography, Descriptions, Tag, Table, Alert, Space } from 'antd';
import {
    CheckCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import type { CreateActionStepProps } from '@/interfaces';
import './CreateActionReviewStep.css';

const { Title, Text } = Typography;

export default function CreateActionReviewStep({ draft }: CreateActionStepProps) {
    const inputs = draft.inputsSchemaJson ?? [];
    const outputs = draft.outputsSchemaJson ?? [];
    const execution = draft.executionJson;
    const uiForm = draft.uiFormJson;
    const policy = draft.policyJson;

    // Validation warnings
    const warnings: string[] = [];
    if (!draft.name) warnings.push('Action name is required.');
    if (!draft.actionKey) warnings.push('Action key is required.');
    if (inputs.length === 0) warnings.push('No input parameters defined.');
    if (outputs.length === 0) warnings.push('No output parameters defined.');
    if (!execution?.endpointUrl && execution?.connectorType !== 'none' && execution?.connectorType !== 'internal') {
        warnings.push('Endpoint URL is not configured.');
    }

    const fieldColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag>{t}</Tag> },
        { title: 'Required', dataIndex: 'required', key: 'required', render: (r: boolean) => r ? <Tag color="red">Yes</Tag> : <Tag>No</Tag> },
        { title: 'Description', dataIndex: 'description', key: 'description' },
    ];

    return (
        <div className="action-review-step">
            <Title level={5} style={{ margin: 0 }}>Review & Publish</Title>
            <Text type="secondary">
                Review all details below before publishing this action to the catalog.
            </Text>

            {warnings.length > 0 && (
                <Alert
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    message={`${warnings.length} warning(s) found`}
                    description={
                        <ul className="action-review-step__warnings">
                            {warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    }
                />
            )}

            {warnings.length === 0 && (
                <Alert
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    message="All checks passed — ready to publish!"
                />
            )}

            {/* Overview */}
            <Descriptions title="Overview" bordered size="small" column={2}>
                <Descriptions.Item label="Name">{draft.name || '—'}</Descriptions.Item>
                <Descriptions.Item label="Action Key">{draft.actionKey || '—'}</Descriptions.Item>
                <Descriptions.Item label="Category">{draft.category || '—'}</Descriptions.Item>
                <Descriptions.Item label="Capability">
                    <Tag color="blue">{draft.capability?.toUpperCase() || '—'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Scope">{draft.scope || '—'}</Descriptions.Item>
                <Descriptions.Item label="Icon">{draft.icon || '🧩'}</Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                    {draft.description || '—'}
                </Descriptions.Item>
            </Descriptions>

            {/* Inputs */}
            <div className="action-review-step__section">
                <Space>
                    <Text strong>Inputs</Text>
                    <Tag>{inputs.length} field(s)</Tag>
                </Space>
                {inputs.length > 0 && (
                    <Table
                        dataSource={inputs.map((f, i) => ({ ...f, key: i }))}
                        columns={fieldColumns}
                        pagination={false}
                        size="small"
                    />
                )}
            </div>

            {/* Execution */}
            {execution && (
                <Descriptions title="Execution" bordered size="small" column={2}>
                    <Descriptions.Item label="Connector">
                        <Tag>{execution.connectorType.toUpperCase()}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Method">
                        <Tag color="geekblue">{execution.httpMethod}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Endpoint" span={2}>
                        {execution.endpointUrl || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Timeout">{execution.timeoutMs}ms</Descriptions.Item>
                    <Descriptions.Item label="Retries">
                        {execution.retryCount} × {execution.retryDelayMs}ms
                    </Descriptions.Item>
                </Descriptions>
            )}

            {/* Outputs */}
            <div className="action-review-step__section">
                <Space>
                    <Text strong>Outputs</Text>
                    <Tag>{outputs.length} field(s)</Tag>
                </Space>
                {outputs.length > 0 && (
                    <Table
                        dataSource={outputs.map((f, i) => ({ ...f, key: i }))}
                        columns={fieldColumns}
                        pagination={false}
                        size="small"
                    />
                )}
            </div>

            {/* UI Form */}
            {uiForm && (
                <Descriptions title="UI Form" bordered size="small" column={2}>
                    <Descriptions.Item label="Display Mode">
                        <Tag>{uiForm.displayMode}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Show Advanced">
                        {uiForm.showAdvanced ? 'Yes' : 'No'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Group Label">{uiForm.groupLabel || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Help Text">{uiForm.helpText || '—'}</Descriptions.Item>
                </Descriptions>
            )}

            {/* Policy */}
            {policy && (
                <Descriptions title="Security & Policy" bordered size="small" column={2}>
                    <Descriptions.Item label="Contains PHI">
                        <Tag color={policy.containsPhi ? 'red' : 'green'}>
                            {policy.containsPhi ? 'Yes' : 'No'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Contains PII">
                        <Tag color={policy.containsPii ? 'red' : 'green'}>
                            {policy.containsPii ? 'Yes' : 'No'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Audit Logging">
                        {policy.requiresAuditLogging ? 'Enabled' : 'Disabled'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Retention">
                        {policy.dataRetentionDays} days
                    </Descriptions.Item>
                    <Descriptions.Item label="Environments" span={2}>
                        {policy.allowedEnvironments.map(env => (
                            <Tag key={env}>{env.toUpperCase()}</Tag>
                        ))}
                    </Descriptions.Item>
                    {policy.notes && (
                        <Descriptions.Item label="Notes" span={2}>
                            {policy.notes}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            )}
        </div>
    );
}
