import { Typography, Descriptions, Divider, Tag, Empty } from 'antd';
import type { CreateActionStepProps } from '@/interfaces';
import './CreateActionReviewStep.css';

const { Title, Text } = Typography;

export default function CreateActionReviewStep({ draft }: CreateActionStepProps) {
    const configData = draft.configurations_json;

    // Transform data solely for accurate preview (mocking the handlePublish cleaning logic)
    const displayData = configData ? { ...configData } : null;
    if (displayData) {
        ['path_params', 'query_params', 'header_params', 'body_params'].forEach(paramType => {
            if (Array.isArray(displayData[paramType])) {
                const filtered = displayData[paramType].filter((param: any) => param && (param.key || param.value));
                if (filtered.length > 0) {
                    if (paramType === 'body_params') {
                        const bodyObj: Record<string, any> = {};
                        filtered.forEach((param: any) => {
                            if (param.key) bodyObj[param.key] = param.value;
                        });
                        displayData.body_params = bodyObj;
                    } else {
                        displayData[paramType] = filtered;
                    }
                } else {
                    delete displayData[paramType];
                }
            }
        });
        
        if (Array.isArray(displayData.input_keys)) {
            const filtered = displayData.input_keys.filter((keyItem: any) => keyItem && keyItem.key);
            if (filtered.length > 0) {
                displayData.input_keys = filtered;
            } else {
                delete displayData.input_keys;
            }
        }
    }

    const configCount = displayData ? Object.keys(displayData).length : 0;

    return (
        <div className="create-action-review">
            <div className="create-action-review__header">
                <Title level={5} className="create-action-review__title">Review & Publish</Title>
                <Text type="secondary">Review your action configuration before publishing to the catalog.</Text>
            </div>

            <Descriptions bordered column={2} size="small" className="create-action-review__descriptions">
                <Descriptions.Item label="Action Name">{draft.name || <Text type="secondary">Not set</Text>}</Descriptions.Item>
                <Descriptions.Item label="Action Key">
                    {draft.action_key ? <Text code>{draft.action_key}</Text> : <Text type="secondary">Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Capability">
                    {draft.capability ? <Tag color="blue">{draft.capability.toUpperCase()}</Tag> : <Text type="secondary">Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Category">{draft.category || <Text type="secondary">Not set</Text>}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Runtime Configuration Payload</Title>
            <Text type="secondary" className="create-action-review__payload-desc">
                These {configCount} parameters define how the {draft.capability?.toUpperCase()} will execute.
            </Text>

            {displayData && Object.keys(displayData).length > 0 ? (
                <div className="create-action-review__payload-container">
                    <pre className="create-action-review__payload-pre">
                        {JSON.stringify(displayData, null, 2)}
                    </pre>
                </div>
            ) : (
                <Empty description="No configuration parameters defined" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </div>
    );
}
