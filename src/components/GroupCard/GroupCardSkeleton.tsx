import { Skeleton } from 'antd';
import '../Skeletons/CapabilityCardSkeleton.css';
import './GroupCard.css';

/**
 * GroupCardSkeleton — Structural mirror of CapabilityCardSkeleton.
 * Ensures zero layout shift when loading organizational groups.
 */
export default function GroupCardSkeleton() {
    return (
        <div className="capability-card-premium capability-card-skeleton">
            <div className="cc-premium-header">
                <div className="cc-premium-icon-box">
                    <Skeleton.Button active shape="square" className="skeleton-premium-icon" />
                </div>
                <div className="cc-menu-btn">
                     <Skeleton.Button active shape="square" className="skeleton-menu-trigger" />
                </div>
            </div>

            <div className="cc-premium-body">
                <div className="capability-name">
                    <Skeleton.Input active size="small" className="skeleton-cap-name" block />
                </div>
                <div className="capability-desc">
                    <Skeleton active paragraph={{ rows: 2, width: ['100%', '75%'] }} title={false} />
                </div>
            </div>
        </div>
    );
}
