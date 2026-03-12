import { Tag, Table } from 'antd';
import { Typography } from 'antd';
import type { ReviewConfigurationsProps } from '@/interfaces';

const { Text } = Typography;

export default function ReviewConfigurations({ configurations }: ReviewConfigurationsProps) {
    const columns = [
        { title: 'Label', dataIndex: 'label', key: 'label' },
        { title: 'Key', dataIndex: 'inputKey', key: 'inputKey', render: (k: string) => <Text code>{k}</Text> },
        { title: 'Type', dataIndex: 'inputType', key: 'inputType', render: (t: string) => <Tag>{t}</Tag> },
        {
            title: 'Default',
            dataIndex: 'defaultValue',
            key: 'defaultValue',
            render: (v: unknown) => v !== undefined && v !== null ? String(v) : '—',
        },
        {
            title: 'Options',
            dataIndex: 'options',
            key: 'options',
            render: (opts: string[] | undefined) =>
                opts && opts.length > 0 ? opts.map(o => <Tag key={o}>{o}</Tag>) : '—',
        },
    ];

    return (
        <div style={{ marginTop: 8 }}>
            <Table
                dataSource={configurations.map((c, i) => ({ ...c, key: i }))}
                columns={columns}
                pagination={false}
                size="small"
                title={() => <Text strong>Configurations ({configurations.length} field(s))</Text>}
            />
        </div>
    );
}
