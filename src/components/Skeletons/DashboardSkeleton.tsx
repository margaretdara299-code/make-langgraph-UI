import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import './DashboardSkeleton.css';

/**
 * DashboardSkeleton — Pixel-accurate loading state mirroring DashboardPage.
 * Matches: header, 4x MetricCards (top-bar + icon-box + label + value),
 * activity container (header with title/subtitle + 2 buttons, table rows).
 */
export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="dashboard-content dsk-root">

            {/* ── Header ── mirrors .industry-header-modern */}
            <div className="dsk-header">
                <Skeleton.Button active className="dsk-title" />
                <Skeleton.Button active className="dsk-subtitle" />
            </div>

            {/* ── Metric Cards ── mirrors 4x MetricCard */}
            <Row gutter={[16, 16]} className="dsk-metrics-row">
                {[0, 1, 2, 3].map((i) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={i}>
                        <div className="dsk-metric-card">
                            {/* top color bar */}
                            <div className="dsk-metric-top-bar" />
                            <div className="dsk-metric-body">
                                {/* icon box */}
                                <Skeleton.Avatar active size={36} shape="square" className="dsk-metric-icon" />
                                {/* label + value */}
                                <div className="dsk-metric-info">
                                    <Skeleton.Button active className="dsk-metric-label" />
                                    <Skeleton.Button active className="dsk-metric-value" />
                                </div>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* ── Activity Container ── mirrors .activity-container */}
            <div className="dsk-activity-box">

                {/* header row */}
                <div className="dsk-activity-header">
                    <div className="dsk-activity-header-left">
                        <div className="dsk-activity-title-row">
                            <Skeleton.Avatar active size={18} shape="square" className="dsk-activity-icon-skel" />
                            <Skeleton.Button active className="dsk-activity-title" />
                        </div>
                        <Skeleton.Button active className="dsk-activity-subtitle" />
                    </div>
                    <div className="dsk-activity-header-right">
                        <Skeleton.Button active className="dsk-activity-btn" />
                        <Skeleton.Button active className="dsk-activity-btn" />
                    </div>
                </div>

                {/* table head */}
                <div className="dsk-table-head">
                    {['40%', '20%', '15%', '15%', '10%'].map((w, i) => (
                        <Skeleton.Button key={i} active className="dsk-th-cell" style={{ width: w }} />
                    ))}
                </div>

                {/* table rows */}
                <div className="dsk-table-body">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div className="dsk-table-row" key={i}>
                            {/* name + key stack */}
                            <div className="dsk-td-name">
                                <Skeleton.Button active className="dsk-td-name-main" />
                                <Skeleton.Button active className="dsk-td-name-sub" />
                            </div>
                            <Skeleton.Button active className="dsk-td-desc" />
                            <Skeleton.Button active className="dsk-td-status" />
                            <Skeleton.Button active className="dsk-td-date" />
                            <Skeleton.Button active className="dsk-td-action" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
