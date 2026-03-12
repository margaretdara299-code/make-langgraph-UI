import { Descriptions, Tag } from 'antd';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import type { ReviewOverviewProps } from '@/interfaces';

export default function ReviewOverview({ draft }: ReviewOverviewProps) {
    return (
        <Descriptions title="Overview" bordered size="small" column={2}>
            <Descriptions.Item label="Name">{draft.name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Action Key">{draft.actionKey || '—'}</Descriptions.Item>
            <Descriptions.Item label="Category">{draft.category || '—'}</Descriptions.Item>
            <Descriptions.Item label="Capability">
                <Tag color="blue">{draft.capability?.toUpperCase() || '—'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Scope">{draft.scope || '—'}</Descriptions.Item>
            <Descriptions.Item label="Icon">
                <IconRenderer iconName={draft.icon} fallback="🧩" size={16} />
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
                {draft.description || '—'}
            </Descriptions.Item>
        </Descriptions>
    );
}
