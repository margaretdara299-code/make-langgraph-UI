import { useEffect } from 'react';
import { Form, Input, Select, Space, Typography, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useCategories, useCapabilities } from '@/hooks';
import { ACTION_KEY_PATTERN, ACTION_DESCRIPTION_MAX_LENGTH } from '@/constants';
import type { ActionCapability, CreateActionOverviewProps } from '@/interfaces';

const { Title } = Typography;
const { TextArea } = Input;

export default function CreateActionOverview({ draft, setDraft, form: externalForm }: CreateActionOverviewProps) {
    const [localForm] = Form.useForm();
    const form = externalForm || localForm;
    const { categories, isLoading: isCategoriesLoading } = useCategories();
    const { capabilities, isLoading: isCapabilitiesLoading } = useCapabilities();

    // Side effect: If draft has IDs but empty/default labels, "repair" them for the preview panel
    // This handles cases where we open in Edit mode and want the preview to be accurate immediately
    useEffect(() => {
        if (!isCategoriesLoading && categories.length > 0 && draft.categoryId) {
            const cat = categories.find(category => (category.categoryId ?? category.id) === draft.categoryId);
            if (cat && draft.category !== cat.name) {
                setDraft(prev => ({ ...prev, category: cat.name }));
            }
        }
    }, [isCategoriesLoading, categories, draft.categoryId, draft.category, setDraft]);

    useEffect(() => {
        if (!isCapabilitiesLoading && capabilities.length > 0 && draft.capabilityId) {
            const cap = capabilities.find(capability => capability.capabilityId === draft.capabilityId);
            if (cap) {
                const capName = cap.name.toLowerCase();
                if (draft.capability !== capName) {
                    setDraft(prev => ({ ...prev, capability: capName }));
                }
            }
        }
    }, [isCapabilitiesLoading, capabilities, draft.capabilityId, draft.capability, setDraft]);

    // Form value changes update the master draft state
    // We also map IDs back to labels so the Preview Panel/ActionCard can show names
    const handleValuesChange = (changedValues: any) => {
        let updates = { ...changedValues };

        // If categoryId changed, find and include the category name label
        if (changedValues.categoryId) {
            const cat = categories.find(category => (category.categoryId ?? category.id) === changedValues.categoryId);
            if (cat) updates.category = cat.name;
        }

        // If capabilityId changed, find and include the capability name & key label
        if (changedValues.capabilityId) {
            const cap = capabilities.find(capability => capability.capabilityId === changedValues.capabilityId);
            if (cap) {
                updates.capability = cap.name.toLowerCase() as ActionCapability;
                // Some logic might expect the name or a specific key, 
                // but ActionCapability is an enum like 'api', 'ai', etc.
            }
        }

        setDraft(prev => ({
            ...prev,
            ...updates,
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
                requiredMark
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
                    <Form.Item name="categoryId" label="Category" rules={[{ required: true, message: 'Category is required' }]} style={{ flex: 1 }}>
                        <Select size="large" placeholder="Select a category" loading={isCategoriesLoading}>
                            {categories.map(cat => (
                                <Select.Option key={cat.categoryId ?? cat.id} value={cat.categoryId ?? cat.id}>
                                    {cat.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="capabilityId" label="Capability" rules={[{ required: true, message: 'Capability is required' }]} style={{ flex: 1 }}>
                        <Select size="large" placeholder="Select a capability" loading={isCapabilitiesLoading}>
                            {capabilities.map(cap => (
                                <Select.Option key={cap.capabilityId} value={cap.capabilityId}>
                                    {cap.name}
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
