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
                    <Skeleton.Button active shape="square" style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                </div>
                <div className="cc-menu-btn">
                     <Skeleton.Button active shape="square" style={{ width: 20, height: 20, borderRadius: 4 }} />
                </div>
            </div>

            <div className="variable-card-content">
                <div className="variable-header-row-enhanced">
                    <Skeleton.Input active size="small" style={{ width: '50%', height: 20 }} />
                </div>
                
                <div className="var-metadata-row-table">
                    <div className="var-meta-column" style={{ width: '30%' }}>
                        <Skeleton.Input active size="small" style={{ width: '100%', height: 10 }} />
                        <Skeleton.Input active size="small" style={{ width: '80%', height: 14 }} />
                    </div>
                    <div className="var-meta-column" style={{ width: '20%' }}>
                        <Skeleton.Input active size="small" style={{ width: '100%', height: 10 }} />
                        <Skeleton.Input active size="small" style={{ width: '60%', height: 14 }} />
                    </div>
                    <div className="var-meta-column var-meta-value-col">
                        <Skeleton.Input active size="small" style={{ width: '40%', height: 10 }} />
                        <Skeleton.Input active size="small" style={{ width: '90%', height: 14 }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
