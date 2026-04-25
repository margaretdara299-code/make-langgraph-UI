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
            return (
                <div className="dc-skill-cell">
                    <span className="dc-skill-icon">
                        <FolderOutlined className="dc-skill-folder-icon" />
                    </span>
                    <div className="dc-skill-info">
                        <span className="dc-skill-name">
                            {record.name || 'Untitled Skill'}
                        </span>
                        <span className="dc-skill-key">
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
        width: 350,
        render: (desc: string) => {
            if (!desc) return <span className="dc-desc-empty">—</span>;
            const truncated = desc.length > 80 ? desc.slice(0, 80) + '...' : desc;
            return (
                <Tooltip title={desc.length > 80 ? desc : undefined} placement="topLeft">
                    <span className={`dc-desc-text ${desc.length > 80 ? 'is-truncated' : ''}`}>
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
            <div className="dc-date-cell">
                <span className="dc-date-main">
                    {new Date(date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="dc-date-time">
                    {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
            </div>
        ),
    },
];
