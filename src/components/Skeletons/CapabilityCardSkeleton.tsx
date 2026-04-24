import React from 'react';
import { Skeleton } from 'antd';
import './CapabilityCardSkeleton.css';

/**
 * CapabilityCardSkeleton — Industry-level loading state.
 * Structurally identical to CapabilityCard for zero layout shift.
 */
export default function CapabilityCardSkeleton() {
    return (
        <div className="capability-card-premium capability-card-skeleton">
            <div className="cc-premium-header">
                <div className="cc-premium-icon-box">
                    <Skeleton.Button active shape="square" style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                </div>
                <div className="cc-menu-btn">
                     <Skeleton.Button active shape="square" style={{ width: 20, height: 20, borderRadius: 4 }} />
                </div>
            </div>

            <div className="cc-premium-body">
                <div className="capability-name">
                    <Skeleton.Input active size="small" style={{ width: '65%', height: 18, marginBottom: 8 }} block />
                </div>
                <div className="capability-desc">
                    <Skeleton active paragraph={{ rows: 2, width: ['100%', '75%'] }} title={false} />
                </div>
            </div>
        </div>
    );
}
