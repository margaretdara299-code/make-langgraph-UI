/**
 * Connectors page — displays API and DB connectors with tabs, search, and grid.
 */

import { useState } from 'react';
import { Input, Button, Typography, Tabs, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CONNECTOR_TAB_CONFIG } from '@/constants';
import type { ConnectorTab } from '@/interfaces';
import './ConnectorsPage.css';

const { Title } = Typography;

export default function ConnectorsPage() {
    const [activeTab, setActiveTab] = useState<ConnectorTab>('api');
    const [searchValue, setSearchValue] = useState('');

    const currentTabConfig = CONNECTOR_TAB_CONFIG.find((t) => t.key === activeTab)!;

    return (
        <div className="connectors-page">
            {/* ── Page Header ── */}
            <div className="connectors-page__header">
                <Title level={3} className="connectors-page__title">Connectors</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => {
                        // TODO: Open create connector modal
                    }}
                >
                    {currentTabConfig.createLabel}
                </Button>
            </div>

            {/* ── Search Bar & Tabs ── */}
            <div className="connectors-page__toolbar">
                <Input.Search
                    placeholder="Search connectors by name or description..."
                    size="large"
                    allowClear
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="connectors-page__search"
                />

                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key as ConnectorTab)}
                    items={CONNECTOR_TAB_CONFIG.map((tab) => ({
                        key: tab.key,
                        label: tab.label,
                    }))}
                />
            </div>

            {/* ── Main Content Area ── */}
            <div className="connectors-page__body">
                <main className="connectors-page__grid-area">
                    <div className="connectors-page__empty">
                        <Empty description={`No ${currentTabConfig.label}s yet. Click "${currentTabConfig.createLabel}" to add one.`} />
                    </div>
                </main>
            </div>
        </div>
    );
}
