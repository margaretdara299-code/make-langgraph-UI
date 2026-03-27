import { useEffect } from 'react';
import { Form, Input, Select, Space, Typography, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useCategories, useCapabilities } from '@/hooks';
import { ACTION_KEY_PATTERN, ACTION_DESCRIPTION_MAX_LENGTH } from '@/constants';
import type { CreateActionOverviewProps } from '@/interfaces';
import './CreateActionOverview.css';

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
        if (!isCategoriesLoading && categories.length > 0 && draft.category_id) {
            const cat = categories.find(category => (category.categoryId ?? category.id) === draft.category_id);
            if (cat && draft.category !== cat.name) {
                setDraft(prev => ({ ...prev, category: cat.name }));
            }
        }
    }, [isCategoriesLoading, categories, draft.category_id, draft.category, setDraft]);

    useEffect(() => {
        if (!isCapabilitiesLoading && capabilities.length > 0 && draft.capability_id) {
            const cap = capabilities.find(capability => capability.capabilityId === draft.capability_id);
            if (cap) {
                const capName = cap.name.toLowerCase();
                if (draft.capability !== capName) {
                    setDraft(prev => ({ ...prev, capability: capName }));
                }
            }
        }
    }, [isCapabilitiesLoading, capabilities, draft.capability_id, draft.capability, setDraft]);

    // Form value changes update the master draft state
    // We also map IDs back to labels so the Preview Panel/ActionCard can show names
    const handleValuesChange = (changedValues: any) => {
        let updates = { ...changedValues };

        // If name changed, also update default_node_title
        if (changedValues.name) {
            updates.default_node_title = changedValues.name;
        }

        // If category_id changed, find and include the category name label
        if (changedValues.category_id) {
            const cat = categories.find(category => (category.categoryId ?? category.id) === changedValues.category_id);
            if (cat) updates.category = cat.name;
        }

        // If capability_id changed, find and include the capability name for the preview
        if (changedValues.capability_id) {
            const cap = capabilities.find(capability => capability.capabilityId === changedValues.capability_id);
            if (cap) {
                updates.capability = cap.name;
            }
        }

        setDraft(prev => ({
            ...prev,
            ...updates,
        }));
    };

    return (
        <div className="create-action-overview">
            <Title level={4} className="create-action-overview__title">Action Overview</Title>

            <Form
                form={form}
                layout="vertical"
                initialValues={draft}
                onValuesChange={handleValuesChange}
                requiredMark
            >
                <div className="create-action-overview__row">
                    <Form.Item
                        name="name"
                        label="Action Name"
                        rules={[{ required: true, message: 'Name is required' }]}
                        className="create-action-overview__flex-1"
                    >
                        <Input placeholder="e.g., Verify Eligibility" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="action_key"
                        label="Action Key"
                        rules={[
                            { required: true, message: 'Key is required' },
                            { pattern: ACTION_KEY_PATTERN, message: 'Only letters, numbers, and underscores. No spaces. (e.g. verify_eligibility)' }
                        ]}
                        className="create-action-overview__flex-1"
                    >
                        <Input placeholder="e.g., verify_eligibility" size="large" />
                    </Form.Item>
                </div>

                <div className="create-action-overview__row">
                    <Form.Item name="category_id" label="Category" rules={[{ required: true, message: 'Category is required' }]} className="create-action-overview__flex-1">
                        <Select size="large" placeholder="Select a category" loading={isCategoriesLoading}>
                            {categories.map(cat => (
                                <Select.Option key={cat.categoryId ?? cat.id} value={cat.categoryId ?? cat.id}>
                                    {cat.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="capability_id" label="Capability" rules={[{ required: true, message: 'Capability is required' }]} className="create-action-overview__flex-1">
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

                <div className="create-action-overview__footer-row">
                    <Form.Item name="icon" label="Icon Reference">
                        <Input size="large" className="create-action-overview__icon-input" />
                    </Form.Item>

                    <Form.Item name="scope" label="Deployment Scope">
                        <Select size="large" className="create-action-overview__scope-select">
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
