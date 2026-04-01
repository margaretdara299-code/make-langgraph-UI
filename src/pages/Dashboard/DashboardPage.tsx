import { useEffect, useState } from 'react';
import { Typography, Row, Col, message, Spin } from 'antd';
import { DashboardMetricsCard } from '@/components';
import { engineService } from '@/services';
import type { DashboardCounts } from '@/interfaces';
import './DashboardPage.css';

const { Title } = Typography;

export default function DashboardPage() {
    const [counts, setCounts] = useState<DashboardCounts | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const data = await engineService.getCounts();
                setCounts(data);
            } catch (err: any) {
                message.error(err.message || 'Failed to load dashboard metrics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCounts();
    }, []);

    if (isLoading) {
        return (
            <div className="dashboard-page__loading">
                <Spin size="large" tip="Loading Dashboard Metrics..." />
            </div>
        );
    }

    if (!counts) {
        return (
            <div className="dashboard-page__loading">
                <Typography.Text type="danger">Failed to load metrics.</Typography.Text>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-page__header">
                <Title level={3} className="dashboard-page__title">Dashboard</Title>
            </div>

            <div className="dashboard-page__body">
                <Row gutter={[24, 24]}>
                    {/* Skills Metrics Card */}
                    <Col xs={24} md={12}>
                        <DashboardMetricsCard type="skills" data={counts.skills} />
                    </Col>

                    {/* Actions Metrics Card */}
                    <Col xs={24} md={12}>
                        <DashboardMetricsCard type="actions" data={counts.actions} />
                    </Col>
                </Row>
            </div>
        </div>
    );
}
