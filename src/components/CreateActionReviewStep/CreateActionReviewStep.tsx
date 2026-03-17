/**
 * CreateActionReviewStep — Step 8: Read-only summary of all configured steps.
 */

import { Typography, Tag, Table, Alert, Space } from 'antd';
import {
    CheckCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import ReviewOverview from './sections/ReviewOverview';
import ReviewExecution from './sections/ReviewExecution';
import ReviewConfigurations from './sections/ReviewConfigurations';
import ReviewUiForm from './sections/ReviewUiForm';
import ReviewPolicy from './sections/ReviewPolicy';
import type { CreateActionStepProps } from '@/interfaces';
import './CreateActionReviewStep.css';

const { Title, Text } = Typography;

export default function CreateActionReviewStep({ draft }: CreateActionStepProps) {
    const inputs = draft.inputsSchemaJson ?? [];
    const outputs = draft.outputsSchemaJson ?? [];
    const execution = draft.executionJson;
    const configurations = draft.configurationsJson ?? [];
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
            <ReviewOverview draft={draft} />

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
            {execution && <ReviewExecution execution={execution} />}

            {/* Outputs */}
            <div className="action-review-step__section">
                <Space>
                    <Text strong>Outputs</Text>
                    <Tag>{outputs.length} field(s)</Tag>
                </Space>
                {outputs.length > 0 && (
                    <Table
                        dataSource={outputs.map((field, index) => ({ ...field, key: index }))}
                        columns={fieldColumns}
                        pagination={false}
                        size="small"
                    />
                )}
            </div>

            {/* Configurations */}
            {configurations.length > 0 && <ReviewConfigurations configurations={configurations} />}

            {/* UI Form */}
            {uiForm && <ReviewUiForm uiForm={uiForm} />}

            {/* Policy */}
            {policy && <ReviewPolicy policy={policy} />}
        </div>
    );
}
