import { Skeleton } from 'antd';
import './GroupsSkeleton.css';

/**
 * Skeleton loader for the Variable Groups grid.
 * Matches the layout of GroupCard for a seamless transition.
 */
export const GroupsSkeleton = () => {
    return (
        <div className="groups-cards-container reveal-up">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div className="group-card" key={`skel-${i}`}>
                    <div className="group-card-header">
                        <div className="group-card-header-left">
                            <Skeleton.Avatar active shape="square" size={32} className="gs-skeleton-avatar" />
                            <div className="group-card-title-stack gs-title-stack">
                                <Skeleton.Button active size="small" className="gs-title-bar" />
                                <Skeleton.Button active size="small" className="gs-subtitle-bar" />
                            </div>
                        </div>
                    </div>
                    <div className="group-card-body gs-body">
                        {[1, 2, 3].map(j => (
                            <div className="variable-list-item gs-var-item" key={`skel-var-${j}`}>
                                <Skeleton.Button active size="small" className="gs-var-name-bar" />
                                <Skeleton.Button active size="small" className="gs-var-val-bar" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
