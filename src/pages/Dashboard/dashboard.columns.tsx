import { Typography, Tooltip, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Skill } from '@/interfaces';

const { Text } = Typography;

export const getDashboardColumns = (navigate: (path: string) => void): ColumnsType<Skill> => [
    {
        title: 'Skill Name',
        key: 'name',
        width: 320,
        render: (_: any, record: Skill) => {
            return (
                <div className="dc-skill-cell">
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
                    <span className="dc-desc-text">
                        {truncated}
                    </span>
                </Tooltip>
            );
        },
    },
    {
        title: 'Status',
        key: 'status',
        width: 140,
        render: (_: any, record: Skill) => {
            const statusMap: Record<string, { label: string, color: string, bg: string }> = {
                published: { label: 'Live', color: '#10b981', bg: '#ecfdf5' },
                draft: { label: 'Draft', color: '#f59e0b', bg: '#fffbeb' },
                review: { label: 'Review', color: '#8b5cf6', bg: '#f5f3ff' }
            };

            const s = statusMap[record.status] || statusMap.draft;

            return (
                <div className="dc-status-badge" style={{ backgroundColor: s.bg, color: s.color }}>
                    <span className="dc-status-dot" style={{ backgroundColor: s.color }} />
                    {s.label}
                </div>
            );
        }
    },
    {
        title: 'Last Updated',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 220,
        render: (date: string) => {
            if (!date) return <span className="dc-date-empty">—</span>;
            const d = new Date(date);
            const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const formattedTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            return (
                <span className="dc-date-full">
                    {formattedDate} - {formattedTime}
                </span>
            );
        },
    },
    {
        title: '',
        key: 'actions',
        width: 100,
        align: 'right',
        render: (_: any, record: Skill) => (
            <span className="dc-view-link">
                View <span className="dc-view-arrow">&gt;</span>
            </span>
        )
    }
];
