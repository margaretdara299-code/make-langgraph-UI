import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Badge, Table, Tooltip, Button, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowRight } from 'lucide-react';
import { MetricCard, DashboardSkeleton, SearchInput } from '@/components';
import { useDashboard } from '@/hooks/useDashboard';
import { PAGE_HEADER_CONTENT } from '@/constants/ui.constants';
import { ROUTES } from '@/routes';
import { getDashboardColumns } from './dashboard.columns';
import type { Skill } from '@/interfaces';
import './DashboardPage.css';

const { Title, Text } = Typography;
const { DASHBOARD } = PAGE_HEADER_CONTENT;

export default function DashboardPage() {
    const navigate = useNavigate();
    const {
        totalActivities,
        searchQuery,
        setSearchQuery,
        isLoading,
        filteredSkills,
        metricsData
    } = useDashboard(50);

    const columns = useMemo(() => getDashboardColumns(navigate), [navigate]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="dashboard-content">
            {/* Header */}
            <div className="industry-header-modern reveal-up">
                <div className="header-title-row">
                    <div className="db-title-column">
                        <Title level={2} className="db-page-title">{DASHBOARD.title}</Title>
                        <Text type="secondary" className="db-page-subtitle">
                            {DASHBOARD.description}
                        </Text>
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <Row gutter={[16, 16]} className="metrics-section reveal-up db-metrics-reveal">
                {metricsData.map((data, idx) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={idx} style={{ '--anim-delay': `${idx * 0.08}s` } as React.CSSProperties} className="reveal-up">
                        <MetricCard {...data} />
                    </Col>
                ))}
            </Row>

            {/* Recent Skill Updates — Table */}
            <div className="activity-container card-elevated reveal-up db-activity-reveal">
                <div className="activity-header-modern">
                    <div className="header-content-left">
                        <div className="title-row">
                            <Title level={4} className="updates-title">{DASHBOARD.updatesTitle}</Title>
                            <span className="title-separator">—</span>
                            <Button
                                type="link"
                                icon={<ArrowRight size={14} />}
                                className="view-all-link"
                                onClick={() => navigate(ROUTES.SKILLS_LIBRARY)}
                            >
                                View all
                            </Button>
                        </div>
                        <Text className="header-description">{DASHBOARD.updatesDescription}</Text>
                    </div>
                    <div className="header-actions-group">
                        <SearchInput
                            placeholder="Search skills..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />
                    </div>
                </div>

                <Table<Skill>
                    dataSource={filteredSkills}
                    columns={columns}
                    rowKey="id"
                    size="small"
                    className="dashboard-skills-table"
                    pagination={false}
                    tableLayout="fixed"
                    scroll={{ y: 320 }}
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

