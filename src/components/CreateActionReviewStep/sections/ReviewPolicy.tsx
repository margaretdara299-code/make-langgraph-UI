import { Descriptions, Tag } from 'antd';
import type { ReviewPolicyProps } from '@/interfaces';

export default function ReviewPolicy({ policy }: ReviewPolicyProps) {
    return (
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
    );
}
