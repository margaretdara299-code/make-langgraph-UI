import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import './DashboardSkeleton.css';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="dashboard-skeleton">
            {/* Greeting Skeleton */}
            <div className="skeleton-greeting">
                <Skeleton.Input active size="large" style={{ width: 300, marginBottom: 12 }} />
                <Skeleton.Input active size="small" style={{ width: 500 }} />
            </div>

            {/* Metrics Grid Skeleton */}
            <Row gutter={[24, 24]} className="skeleton-metrics">
                {[1, 2, 3, 4].map((i) => (
                    <Col xs={24} sm={12} lg={6} key={i}>
                        <div className="skeleton-metric-card">
                            <div className="skeleton-card-header">
                                <Skeleton.Avatar active size="large" shape="square" />
                                <Skeleton.Input active size="small" style={{ width: 60 }} />
                            </div>
                            <div className="skeleton-card-body">
                                <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
                                <Skeleton.Input active size="large" style={{ width: 120 }} />
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Activity Box Skeleton */}
            <div className="skeleton-activity-box">
                <div className="skeleton-box-header">
                    <Skeleton.Input active size="default" style={{ width: 150 }} />
                    <Skeleton.Button active size="small" style={{ width: 80 }} />
                </div>
                <div className="skeleton-stream">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton-stream-item">
                            <Skeleton.Avatar active size="default" shape="circle" />
                            <div className="skeleton-item-details">
                                <Skeleton.Input active size="small" style={{ width: '40%', marginBottom: 4 }} />
                                <Skeleton.Input active size="small" style={{ width: '20%' }} />
                            </div>
                            <Skeleton.Button active size="small" style={{ width: 60 }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
