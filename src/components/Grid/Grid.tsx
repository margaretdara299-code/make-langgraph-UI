import { Row, Col } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
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
    autoFitMinWidth,
    keyExtractor,
    prependItems
}: GridProps<T>) {
    const skeletonCount = count ?? 12;
    const totalItems = prependItems ? prependItems.length + (data?.length ?? 0) : data?.length ?? 0;
    const displayCount = Math.max(skeletonCount, totalItems);
    const minWidth = typeof autoFitMinWidth === 'number' ? `${autoFitMinWidth}px` : autoFitMinWidth;
    const autoFitStyle = autoFitMinWidth ? ({
        ['--app-grid-min-width' as string]: minWidth,
        ['--app-grid-gap-x' as string]: `${gutter[0]}px`,
        ['--app-grid-gap-y' as string]: `${gutter[1]}px`,
    } as CSSProperties) : undefined;

    const wrapAutoFitItem = (content: ReactNode, key: string | number) => (
        <div className="app-grid__auto-item" key={key}>
            {content}
        </div>
    );
    
    if (isLoading) {
        if (autoFitMinWidth) {
            return (
                <div className="app-grid__auto" style={autoFitStyle}>
                    {[...Array(displayCount)].map((_, i) =>
                        wrapAutoFitItem(
                            SkeletonComponent ? <SkeletonComponent /> : <div className="app-grid__default-skeleton" />,
                            `skeleton-${i}`
                        )
                    )}
                </div>
            );
        }

        return (
            <Row gutter={gutter} className="app-grid__row">
                {[...Array(displayCount)].map((_, i) => (
                    <Col {...columns} key={`skeleton-${i}`} className="app-grid__col">
                        {SkeletonComponent ? <SkeletonComponent /> : <div className="app-grid__default-skeleton" />}
                    </Col>
                ))}
            </Row>
        );
    }

    if (!data && !prependItems) return null;

    const items: ReactNode[] = [];
    
    if (prependItems) {
        prependItems.forEach((item, index) => {
            items.push(
                autoFitMinWidth
                    ? wrapAutoFitItem(item, `prepend-${index}`)
                    : <Col {...columns} key={`prepend-${index}`} className="app-grid__col">{item}</Col>
            );
        });
    }
    
    if (data) {
        data.forEach((item, index) => {
            items.push(
                autoFitMinWidth
                    ? wrapAutoFitItem(renderItem?.(item), keyExtractor ? keyExtractor(item) : `item-${index}`)
                    : (
                        <Col {...columns} key={keyExtractor ? keyExtractor(item) : `item-${index}`} className="app-grid__col">
                            {renderItem?.(item)}
                        </Col>
                    )
            );
        });
    }

    if (autoFitMinWidth) {
        return (
            <div className="app-grid__auto" style={autoFitStyle}>
                {items}
            </div>
        );
    }

    return (
        <Row gutter={gutter} className="app-grid__row">
            {items}
        </Row>
    );
}
