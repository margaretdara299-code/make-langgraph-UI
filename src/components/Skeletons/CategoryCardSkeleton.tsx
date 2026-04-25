import React from 'react';
import { Skeleton } from 'antd';
import './CategoryCardSkeleton.css';

/**
 * CategoryCardSkeleton — Dense structural match for category groupings.
 */
export default function CategoryCardSkeleton() {
    return (
        <div className="category-card-skeleton reveal-up">
            <div className="skeleton-header">
                <Skeleton.Button active size="small" shape="square" className="cat-sk-icon" />
                <Skeleton.Button active shape="square" size="small" className="cat-sk-menu" />
            </div>
            <div className="skeleton-body">
                <Skeleton.Input active size="small" className="cat-sk-title" />
                <Skeleton active title={false} paragraph={{ rows: 1 }} />
            </div>
        </div>
    );
}
