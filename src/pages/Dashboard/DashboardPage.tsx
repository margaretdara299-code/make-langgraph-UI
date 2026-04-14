import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { Typography, message, Spin, Row, Col, Layout, Badge } from 'antd';
import {
    BulbOutlined,
    SettingOutlined,
    RocketOutlined,
    AppstoreOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { MetricCard, DashboardSkeleton } from '@/components';
import { engineService, fetchSkills } from '@/services';
import type { DashboardCounts, Skill } from '@/interfaces';
import './DashboardPage.css';

const { Title, Text } = Typography;

export default function DashboardPage() {
    const navigate = useNavigate();
    const [counts, setCounts] = useState<DashboardCounts | null>(null);
    const [recentSkills, setRecentSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [countsData, skillsData] = await Promise.all([
                engineService.getCounts(),
                fetchSkills({ pageSize: 5 })
            ]);
            setCounts(countsData);
            setRecentSkills(skillsData.data);
        } catch (err: any) {
            message.error(err.message || 'Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const metricsData = useMemo(() => {
        if (!counts) return [];

        const { skills, actions } = counts;

        return [
            {
                label: 'Total Skills',
                value: skills.total,
                subtext: `${skills.active} Active`,
                isPositive: skills.active > 0,
                color: '#6366f1',
                icon: BulbOutlined
            },
            {
                label: 'Draft Skills',
                value: skills.draftVersions,
                subtext: `${skills.publishedVersions} Published`,
                isPositive: skills.publishedVersions > 0,
                color: '#10b981',
                icon: RocketOutlined
            },
            {
                label: 'Total Actions',
                value: actions.total,
                subtext: `${actions.active} Active`,
                isPositive: actions.active > 0,
                color: '#f59e0b',
                icon: SettingOutlined
            },
            {
                label: 'Published Actions',
                value: actions.published,
                subtext: `${actions.draft} Draft`,
                isPositive: actions.published > 0,
                color: '#ec4899',
                icon: AppstoreOutlined
            },
        ];
    }, [counts]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="dashboard-content">
            <header className="greeting-card reveal-up">
                <div className="greeting-content">
                    <div className="greeting-logo-wrap">
                        <img src="/tensawLogo.jpg" alt="Tensaw Logo" className="greeting-logo" />
                    </div>
                    <div className="greeting-text">
                        <Title level={1}>Tensaw Skills Studio</Title>
                        <Text className="subtitle">Optimize your enterprise automation with intelligent workflow orchestration and AI-ready skills.</Text>
                    </div>
                </div>

            </header>

            <Row gutter={[24, 24]} className="dashboard-main-row">
                {/* Left Side: 2x2 Metrics Grid */}
                <Col xs={24} lg={14} className="metrics-section">
                    <Row gutter={[16, 16]}>
                        {metricsData.map((data, idx) => (
                            <Col xs={24} sm={12} key={idx} className="reveal-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <MetricCard {...data} />
                            </Col>
                        ))}
                    </Row>


                </Col>

                {/* Right Side: Recent Updates */}
                <Col xs={24} lg={10} className="updates-section">
                    <div className="activity-box card-elevated reveal-up" style={{ animationDelay: '0.4s' }}>
                        <div className="box-header">
                            <div className="box-title-wrap">
                                <HistoryOutlined className="box-title-icon" />
                                <Title level={4} className="box-title">Recent Updates</Title>
                            </div>
                            <button className="text-btn" onClick={() => navigate(ROUTES.SKILLS_LIBRARY)}>View All</button>
                        </div>
                        <div className="activity-stream">
                            {recentSkills.length > 0 ? (
                                recentSkills.map((skill, idx) => (
                                    <div key={skill.id} className="activity-item" style={{ animationDelay: `${0.5 + idx * 0.05}s` }}>
                                        <div className="activity-icon-wrap info">
                                            <BulbOutlined />
                                        </div>
                                        <div className="activity-details">
                                            <div className="activity-msg">
                                                <span className="activity-skill-name">{skill.name}</span>
                                                <span className="activity-subtext">
                                                    Updated {new Date(skill.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`activity-tag status-${skill.status || 'draft'}`}>
                                            {skill.status || 'Draft'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">No recent activity found.</div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}
