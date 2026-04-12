import React from 'react';
import { Skeleton } from 'antd';
import './ActionCardSkeleton.css';

/**
 * ActionCardSkeleton — Industrial-level loading state.
 * Structurally identical to ActionCard (premium) for zero layout shift.
 */
export default function ActionCardSkeleton() {
    return (
        <div className="action-card-premium action-card-skeleton reveal-up">
            <div className="ac-premium-header">
                <div className="ac-premium-icon-box skeleton-box">
                    <Skeleton.Avatar active shape="square" size={32} />
                </div>
                <div className="ac-header-right">
                    <div className="ac-status-date">
                        <Skeleton.Button active shape="round" style={{ width: 60, height: 18 }} />
                        <Skeleton.Button active shape="round" style={{ width: 50, height: 12 }} />
                    </div>
                    <div className="ac-premium-actions">
                        <Skeleton.Button active shape="square" style={{ width: 24, height: 24, borderRadius: 6 }} />
                    </div>
                </div>
            </div>

            <div className="ac-premium-body">
                <div className="ac-name-row">
                    <Skeleton.Input active size="small" style={{ width: '60%', height: 18 }} />
                    <Skeleton.Button active shape="round" size="small" style={{ width: 40, height: 14 }} />
                </div>
                <div className="ac-desc-placeholder">
                    <Skeleton active title={false} paragraph={{ rows: 2, width: ['100%', '85%'] }} />
                </div>
            </div>
        </div>
    );
}
