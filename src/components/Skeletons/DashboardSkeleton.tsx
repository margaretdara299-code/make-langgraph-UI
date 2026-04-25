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
                    <div className="skeleton-header-stack">
                        <Skeleton.Button active className="skeleton-title-bar" />
                        <Skeleton.Button active className="skeleton-subtitle-bar" />
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
                                <Skeleton.Button active className="skeleton-metric-badge" />
                            </div>
                            <div className="skeleton-card-body">
                                <Skeleton.Button active className="skeleton-metric-title" />
                                <Skeleton.Button active className="skeleton-metric-subtitle" />
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Table Container Mirror */}
            <div className="skeleton-activity-box">
                <div className="skeleton-box-header">
                    <div className="skeleton-box-header-stack">
                        <Skeleton.Button active className="skeleton-box-title" />
                        <Skeleton.Button active className="skeleton-box-subtitle" />
                    </div>
                    <Skeleton.Input active className="skeleton-box-search" />
                </div>
                
                <div className="skeleton-table-body">
                    <Skeleton active paragraph={{ rows: 12 }} title={false} />
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;