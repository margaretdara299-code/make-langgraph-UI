import React from 'react';
import { Skeleton } from 'antd';
import './CategoryCardSkeleton.css';

export default function CategoryCardSkeleton() {
    return (
        <div className="category-card-skeleton reveal-up">
            <div className="skeleton-header">
                <Skeleton.Button active size="small" shape="square" style={{ width: 26, height: 26, borderRadius: 8 }} />
                <Skeleton.Button active shape="square" size="small" style={{ width: 20, height: 20, borderRadius: 4 }} />
            </div>
            <div className="skeleton-body">
                <Skeleton.Input active size="small" style={{ width: '60%', height: 16, marginBottom: 4 }} />
                <Skeleton active title={false} paragraph={{ rows: 1 }} />
            </div>
        </div>
    );
}
