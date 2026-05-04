import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col, Space, Dropdown } from 'antd';
import { ArrowRight, PenLine, Filter } from 'lucide-react';
import { MetricCard, DashboardSkeleton, CollectionPageHeader } from '@/components';
import { useDashboard } from '@/hooks/useDashboard';
import { PAGE_HEADER_CONTENT } from '@/constants/ui.constants';
import { ROUTES } from '@/routes';
import { getDashboardColumns } from './dashboard.columns';
import type { Skill } from '@/interfaces';
import './DashboardPage.css';

const { DASHBOARD } = PAGE_HEADER_CONTENT;

export default function DashboardPage() {
    const navigate = useNavigate();
    const {
        isLoading,
        filteredSkills,
        metricsData
    } = useDashboard(50);

    const [sortOrder, setSortOrder] = useState<{ columnKey: string, order: 'ascend' | 'descend' | null }>({
        columnKey: 'updatedAt',
        order: 'descend'
    });

    const sortMenuItems = [
        {
            key: 'name-ascend',
            label: 'Sort by Name (Asc)',
        },
        {
            key: 'name-descend',
            label: 'Sort by Name (Desc)',
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'updatedAt-ascend',
            label: 'Sort by Date (Oldest First)',
        },
        {
            key: 'updatedAt-descend',
            label: 'Sort by Date (Newest First)',
        },
    ];

    const columns = useMemo(() => getDashboardColumns(navigate), [navigate]);

    const sortedSkills = useMemo(() => {
        const data = [...filteredSkills];
        const { columnKey, order } = sortOrder;
        if (!order) return data;

        data.sort((a, b) => {
            if (columnKey === 'name') {
                const valA = a.name || '';
                const valB = b.name || '';
                return order === 'ascend' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (columnKey === 'updatedAt') {
                const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                return order === 'ascend' ? dateA - dateB : dateB - dateA;
            }
            return 0;
        });
        return data;
    }, [filteredSkills, sortOrder]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="dashboard-content">
            <CollectionPageHeader
                title={DASHBOARD.title}
                description={DASHBOARD.description}
                className="reveal-up"
            />

            {/* Metric Cards */}
            <Row gutter={[16, 16]} className="metrics-section reveal-up db-metrics-reveal">
                {metricsData.map((data, idx) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={idx} style={{ '--anim-delay': `${idx * 0.08}s` } as React.CSSProperties} className="reveal-up">
                        <MetricCard subtext={''} isPositive={false} {...data} />
                    </Col>
                ))}
            </Row>

            {/* Recent Skill Updates — Table */}
            <div className="activity-container card-elevated reveal-up db-activity-reveal">
                <div className="activity-header-modern">
                    <div className="header-content-left">
                        <div className="dashboard__activity-title-row">
                            <PenLine size={18} className="activity-icon" />
                            <h2 className="updates-title">Skill Activity</h2>
                        </div>
                        <p className="header-description">Live activity log of deployments and studio events.</p>
                    </div>
                    <div className="header-actions-group">
                        <Space size="middle">
                            <Dropdown 
                                menu={{ 
                                    items: sortMenuItems,
                                    onClick: ({ key }) => {
                                        const [columnKey, order] = key.split('-');
                                        setSortOrder({ columnKey, order: order as 'ascend' | 'descend' });
                                    }
                                }} 
                                trigger={['click']} 
                                placement="bottomRight"
                            >
                                <Button 
                                    icon={<Filter size={14} />} 
                                    className="activity-filter-btn"
                                >
                                    Sort & Filter
                                </Button>
                            </Dropdown>
                            <Button
                                type="default"
                                icon={<ArrowRight size={14} />}
                                className="activity-view-all-btn"
                                onClick={() => navigate(ROUTES.SKILLS_LIBRARY)}
                            >
                                View All
                            </Button>
                        </Space>
                    </div>
                </div>

                <Table<Skill>
                    dataSource={sortedSkills}
                    columns={columns}
                    rowKey="id"
                    size="small"
                    className="dashboard-skills-table"
                    pagination={false}
                    tableLayout="fixed"
                    scroll={{ y: 'clamp(320px, 48vh, 520px)' }}
                    onRow={(record) => ({
                        className: 'db-row-clickable',
                        onClick: () => {
                            if (record.id && record.latestVersionId) {
                                navigate(`/skills/${record.id}/versions/${record.latestVersionId}/design`);
                            } else {
                                navigate(ROUTES.SKILLS_LIBRARY);
                            }
                        },
                    })}
                    locale={{ emptyText: <div className="empty-state">No recent skills found.</div> }}
                />
            </div>
        </div>
    );
}
