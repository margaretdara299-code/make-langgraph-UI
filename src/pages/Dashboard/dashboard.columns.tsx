import { Typography, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FolderOutlined } from '@ant-design/icons';
import type { Skill } from '@/interfaces';

const { Text } = Typography;

export const getDashboardColumns = (navigate: (path: string) => void): ColumnsType<Skill> => [
    {
        title: 'Skill Name',
        key: 'name',
        width: 300,
        render: (_: any, record: Skill) => {
            // Debugging log for each row
            console.log('Rendering row for skill:', record.id, record);
            
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'var(--accent-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--border-light)'
                    }}>
                        <FolderOutlined style={{ fontSize: 15, color: 'var(--accent)' }} />
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, overflow: 'visible' }}>
                        <span style={{ 
                            fontSize: 13, 
                            fontWeight: 600, 
                            color: 'var(--text-main)', 
                            display: 'block'
                        }}>
                            {record.name || 'Untitled Skill'}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {record.skillKey || 'no-key-found'}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: 200,
        render: (desc: string) => {
            if (!desc) return <span style={{ color: 'var(--text-subtle)', fontSize: 12 }}>—</span>;
            const truncated = desc.length > 30 ? desc.slice(0, 30) + '...' : desc;
            return (
                <Tooltip title={desc.length > 30 ? desc : undefined} placement="topLeft">
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', cursor: desc.length > 30 ? 'help' : 'default' }}>
                        {truncated}
                    </span>
                </Tooltip>
            );
        },
    },

    {
        title: 'Last Updated',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 150,
        render: (date: string) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>
                    {new Date(date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span style={{ fontSize: 10 }}>
                    {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
            </div>
        ),
    },
];
