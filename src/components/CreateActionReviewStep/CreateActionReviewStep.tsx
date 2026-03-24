import { Typography, Descriptions, Divider, Tag, Empty } from 'antd';
import type { CreateActionStepProps } from '@/interfaces';
import './CreateActionReviewStep.css';

const { Title, Text } = Typography;

export default function CreateActionReviewStep({ draft }: CreateActionStepProps) {
    const configCount = draft.configurationsJson ? Object.keys(draft.configurationsJson).length : 0;

    return (
        <div className="create-action-review">
            <div className="create-action-review__header">
                <Title level={5} className="create-action-review__title">Review & Publish</Title>
                <Text type="secondary">Review your action configuration before publishing to the catalog.</Text>
            </div>

            <Descriptions bordered column={2} size="small" className="create-action-review__descriptions">
                <Descriptions.Item label="Action Name">{draft.name || <Text type="secondary">Not set</Text>}</Descriptions.Item>
                <Descriptions.Item label="Action Key">
                    {draft.actionKey ? <Text code>{draft.actionKey}</Text> : <Text type="secondary">Not set</Text>}
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

            {configCount > 0 ? (
                <div className="create-action-review__payload-container">
                    <pre className="create-action-review__payload-pre">
                        {JSON.stringify(draft.configurationsJson, null, 2)}
                    </pre>
                </div>
            ) : (
                <Empty description="No configuration parameters defined" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </div>
    );
}
