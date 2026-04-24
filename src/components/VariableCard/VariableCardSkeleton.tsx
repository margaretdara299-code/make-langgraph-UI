import { Skeleton } from 'antd';
import '../Skeletons/CapabilityCardSkeleton.css';
import './VariableCard.css';

/**
 * VariableCardSkeleton — Structural mirror of the Side-by-Side Mini layout.
 */
export default function VariableCardSkeleton() {
    return (
        <div className="capability-card-premium capability-card-skeleton variable-card-enhanced">
            <div className="cc-premium-header">
                <div className="cc-premium-icon-box">
                    <Skeleton.Button active shape="square" className="skeleton-premium-icon" />
                </div>
                <div className="cc-menu-btn">
                     <Skeleton.Button active shape="square" className="skeleton-menu-trigger" />
                </div>
            </div>

            <div className="variable-card-content">
                <div className="variable-header-row-enhanced">
                    <Skeleton.Input active size="small" className="skeleton-var-title" />
                </div>
                
                <div className="var-metadata-row-table">
                    <div className="var-meta-column skeleton-meta-col-30">
                        <Skeleton.Input active size="small" className="skeleton-meta-label-100" />
                        <Skeleton.Input active size="small" className="skeleton-meta-value-80" />
                    </div>
                    <div className="var-meta-column skeleton-meta-col-20">
                        <Skeleton.Input active size="small" className="skeleton-meta-label-100" />
                        <Skeleton.Input active size="small" className="skeleton-meta-value-60" />
                    </div>
                    <div className="var-meta-column var-meta-value-col">
                        <Skeleton.Input active size="small" className="skeleton-meta-label-40" />
                        <Skeleton.Input active size="small" className="skeleton-meta-value-90" />
                    </div>
                </div>
            </div>
        </div>
    );
}
