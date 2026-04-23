import { Skeleton } from 'antd';

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
                            <Skeleton.Avatar active shape="square" size={32} style={{ borderRadius: '8px' }} />
                            <div className="group-card-title-stack" style={{ marginLeft: '12px' }}>
                                <Skeleton.Button active size="small" style={{ width: '120px', height: '16px' }} />
                                <Skeleton.Button active size="small" style={{ width: '80px', height: '12px', marginTop: '4px' }} />
                            </div>
                        </div>
                    </div>
                    <div className="group-card-body" style={{ marginTop: '16px' }}>
                        {[1, 2, 3].map(j => (
                            <div className="variable-list-item" key={`skel-var-${j}`} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
                                <Skeleton.Button active size="small" style={{ width: '100px', height: '14px' }} />
                                <Skeleton.Button active size="small" style={{ width: '60px', height: '14px', marginLeft: 'auto' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
