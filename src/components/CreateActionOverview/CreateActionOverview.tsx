/**
 * CreateActionOverview — Step 1 of the Action Creation Wizard.
 * Updates the parent draft state directly so the Preview Panel reacts.
 */

import { Form, Input, Select, Space, Typography, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ACTION_CATEGORIES, CAPABILITY_OPTIONS, ACTION_KEY_PATTERN, ACTION_DESCRIPTION_MAX_LENGTH } from '@/constants';
import type { ActionCapability, CreateActionOverviewProps } from '@/interfaces';

const { Title } = Typography;
const { TextArea } = Input;

export default function CreateActionOverview({ draft, setDraft }: CreateActionOverviewProps) {
    const [form] = Form.useForm();

    // Form value changes directly update the master draft state for live preview
    const handleValuesChange = (changedValues: any) => {
        setDraft(prev => ({
            ...prev,
            ...changedValues,
        }));
    };

    return (
        <div className="create-action-overview">
            <Title level={4} style={{ marginBottom: 24 }}>Action Overview</Title>

            <Form
                form={form}
                layout="vertical"
                initialValues={draft}
                onValuesChange={handleValuesChange}
                requiredMark="optional"
            >
                <div style={{ display: 'flex', gap: 24 }}>
                    <Form.Item
                        name="name"
                        label="Action Name"
                        rules={[{ required: true, message: 'Name is required' }]}
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="e.g., Verify Eligibility" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="actionKey"
                        label="Action Key"
                        rules={[
                            { required: true, message: 'Key is required' },
                            { pattern: ACTION_KEY_PATTERN, message: 'Use lowercase dot notation (e.g. api.eligibility)' }
                        ]}
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="e.g., api.eligibility.verify" size="large" />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: 24 }}>
                    <Form.Item name="category" label="Category" style={{ flex: 1 }}>
                        <Select size="large">
                            {ACTION_CATEGORIES.map(cat => (
                                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="capability" label="Capability" style={{ flex: 1 }}>
                        <Select size="large">
                            {/* Filter out 'all' because an action must be assigned a specific capability */}
                            {CAPABILITY_OPTIONS.filter(opt => opt.value !== 'all').map(opt => (
                                <Select.Option key={opt.value} value={opt.value as ActionCapability}>
                                    {opt.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <TextArea
                        placeholder="Describe what this action does..."
                        rows={3}
                        maxLength={ACTION_DESCRIPTION_MAX_LENGTH}
                        showCount
                    />
                </Form.Item>

                <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                    <Form.Item name="icon" label="Icon Reference">
                        <Input size="large" style={{ width: 120, textAlign: 'center' }} />
                    </Form.Item>

                    <Form.Item name="scope" label="Deployment Scope">
                        <Select size="large" style={{ width: 200 }}>
                            <Select.Option value="global">
                                <Space>Global <Tooltip title="Visible to all clients"><InfoCircleOutlined /></Tooltip></Space>
                            </Select.Option>
                            <Select.Option value="client">Client Only</Select.Option>
                        </Select>
                    </Form.Item>
                </div>
            </Form>
        </div>
    );
}
