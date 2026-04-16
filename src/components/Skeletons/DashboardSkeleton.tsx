import React from 'react';
import { Row, Col, Skeleton, Space } from 'antd';
import './DashboardSkeleton.css';

/**
 * DashboardSkeleton — High-fidelity loading state that mirrors 
 * the structure of DashboardPage perfectly.
 */
export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="dashboard-content dashboard-skeleton">
            {/* Header Mirror */}
            <div className="industry-header-modern">
                <div className="header-title-row">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Skeleton.Button active style={{ width: 220, height: 32, marginBottom: 8 }} />
                        <Skeleton.Button active style={{ width: 380, height: 16 }} />
                    </div>
                </div>
            </div>

            {/* Metric Cards Mirror */}
            <Row gutter={[16, 16]} className="skeleton-metrics">
                {[1, 2, 3, 4].map((i) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={i}>
                        <div className="skeleton-metric-card">
                            <div className="skeleton-card-header">
                                <Skeleton.Avatar active size="small" shape="square" />
                                <Skeleton.Button active style={{ width: 40, height: 20 }} />
                            </div>
                            <div className="skeleton-card-body">
                                <Skeleton.Button active style={{ width: '100%', height: 28, marginBottom: 8 }} />
                                <Skeleton.Button active style={{ width: '60%', height: 14 }} />
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Table Container Mirror */}
            <div className="skeleton-activity-box" style={{ marginTop: 16 }}>
                <div className="skeleton-box-header">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Skeleton.Button active style={{ width: 180, height: 24, marginBottom: 8 }} />
                        <Skeleton.Button active style={{ width: 260, height: 14 }} />
                    </div>
                    <Skeleton.Input active style={{ width: 320, height: 40, borderRadius: 10 }} />
                </div>
                
                <div style={{ padding: '24px', minHeight: '400px' }}>
                    <Skeleton active paragraph={{ rows: 12 }} title={false} />
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;