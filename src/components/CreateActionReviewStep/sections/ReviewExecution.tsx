import { Descriptions, Tag } from 'antd';
import type { ReviewExecutionProps } from '@/interfaces';

export default function ReviewExecution({ execution }: ReviewExecutionProps) {
    return (
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
    );
}
