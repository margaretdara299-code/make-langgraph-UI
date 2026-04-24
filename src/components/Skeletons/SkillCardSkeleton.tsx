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
                    <Skeleton.Button active shape="round" className="sk-skeleton-badge-lg" />
                    <Skeleton.Button active shape="round" className="sk-skeleton-badge-sm" />
                </div>
                <Skeleton.Button active shape="square" className="sk-skeleton-menu-btn" />
            </div>

            <div className="skeleton-content-area">
                <div className="title-placeholder">
                    <Skeleton.Input active size="small" className="sk-skeleton-title" block />
                </div>
                <div className="key-placeholder">
                    <Skeleton.Input active size="small" className="sk-skeleton-key" block />
                </div>
                <div className="description-placeholder">
                    <Skeleton active title={false} paragraph={{ rows: 2, width: ['100%', '85%'] }} />
                </div>
            </div>

            <div className="skeleton-meta-divider">
                <div className="meta-left">
                    <Skeleton.Button active size="small" className="sk-skeleton-meta-left" />
                </div>
                <div className="meta-right">
                    <Skeleton.Button active size="small" className="sk-skeleton-meta-right" />
                </div>
            </div>

            <div className="skeleton-footer-section">
                <div className="date-placeholder">
                    <Skeleton.Input active size="small" className="sk-skeleton-date" />
                </div>
                <div className="tags-placeholder">
                    <Skeleton.Avatar active size="small" shape="square" className="sk-skeleton-tag" />
                    <Skeleton.Avatar active size="small" shape="square" className="sk-skeleton-tag" />
                </div>
            </div>
        </div>
    );
}
