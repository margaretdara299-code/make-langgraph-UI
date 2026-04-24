import React from 'react';
import { Skeleton } from 'antd';
import './SkillCardSkeleton.css';

/**
 * SkillCardSkeleton — Industry-level premium loading state.
 * Structurally identical to SkillCard (premium version) for zero layout shift.
 */
export default function SkillCardSkeleton() {
    return (
        <div className="skill-card-premium-skeleton">
            <div className="skeleton-header-row">
                <div className="header-badges">
                    <Skeleton.Button active shape="round" style={{ width: 60, height: 20 }} />
                    <Skeleton.Button active shape="round" style={{ width: 45, height: 20 }} />
                </div>
                <Skeleton.Button active shape="square" style={{ width: 24, height: 24, borderRadius: 6 }} />
            </div>

            <div className="skeleton-content-area">
                <div className="title-placeholder">
                    <Skeleton.Input active size="small" style={{ width: '80%', height: 20 }} block />
                </div>
                <div className="key-placeholder">
                    <Skeleton.Input active size="small" style={{ width: '40%', height: 14 }} block />
                </div>
                <div className="description-placeholder">
                    <Skeleton active title={false} paragraph={{ rows: 2, width: ['100%', '85%'] }} />
                </div>
            </div>

            <div className="skeleton-meta-divider">
                <div className="meta-left">
                    <Skeleton.Button active size="small" style={{ width: 70, height: 14 }} />
                </div>
                <div className="meta-right">
                    <Skeleton.Button active size="small" style={{ width: 50, height: 14 }} />
                </div>
            </div>

            <div className="skeleton-footer-section">
                <div className="date-placeholder">
                    <Skeleton.Input active size="small" style={{ width: 90, height: 12 }} />
                </div>
                <div className="tags-placeholder">
                    <Skeleton.Avatar active size="small" shape="square" style={{ width: 40, height: 18, borderRadius: 4 }} />
                    <Skeleton.Avatar active size="small" shape="square" style={{ width: 40, height: 18, borderRadius: 4 }} />
                </div>
            </div>
        </div>
    );
}
