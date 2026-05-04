import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import type { ReactNode } from 'react';
import './CollectionPageTabs.css';

interface CollectionPageTabsProps {
    activeKey: string;
    onChange: (key: string) => void;
    items: TabsProps['items'];
    trailing?: ReactNode;
    className?: string;
}

export default function CollectionPageTabs({
    activeKey,
    onChange,
    items,
    trailing,
    className,
}: CollectionPageTabsProps) {
    const rootClassName = ['collection-page-tabs', className].filter(Boolean).join(' ');

    return (
        <div className={rootClassName}>
            <Tabs
                activeKey={activeKey}
                onChange={onChange}
                items={items}
                className="collection-page-tabs__tabs"
            />
            {trailing ? <div className="collection-page-tabs__trailing">{trailing}</div> : null}
        </div>
    );
}
