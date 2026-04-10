import { Row, Col } from 'antd';
import type { GridProps } from '@/interfaces';
import './Grid.css';

/**
 * Grid — A high-performance listing component that handles
 * skeletons, prepended items (creation cards), and responsive columns.
 */
export function Grid<T>({ 
    data,
    isLoading,
    SkeletonComponent,
    renderItem,
    count,
    gutter = [16, 16],
    columns = { xs: 24, sm: 12, md: 8, lg: 6, xl: 4 },
    keyExtractor,
    prependItems
}: GridProps<T>) {
    const skeletonCount = count ?? 12;
    const totalItems = prependItems ? prependItems.length + (data?.length ?? 0) : data?.length ?? 0;
    const displayCount = Math.max(skeletonCount, totalItems);
    
    if (isLoading) {
        return (
            <Row gutter={gutter}>
                {[...Array(displayCount)].map((_, i) => (
                    <Col {...columns} key={`skeleton-${i}`}>
                        {SkeletonComponent ? <SkeletonComponent /> : <div style={{ height: 200, background: 'var(--border-light)', borderRadius: 16 }} />}
                    </Col>
                ))}
            </Row>
        );
    }

    if (!data && !prependItems) return null;

    const items: React.ReactNode[] = [];
    
    if (prependItems) {
        prependItems.forEach((item, index) => {
            items.push(<Col {...columns} key={`prepend-${index}`}>{item}</Col>);
        });
    }
    
    if (data) {
        data.forEach((item, index) => {
            items.push(
                <Col {...columns} key={keyExtractor ? keyExtractor(item) : `item-${index}`}>
                    {renderItem?.(item)}
                </Col>
            );
        });
    }

    return (
        <Row gutter={gutter}>
            {items}
        </Row>
    );
}
