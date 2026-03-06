/**
 * Placeholder for the Action Catalog page.
 * Will be implemented in Phase 4 of the roadmap.
 */

import { useState } from 'react';
import { Input, Select, Button, Typography, Spin, Empty, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useActions } from '@/hooks';
import { ActionCard, StatusFilterItem } from '@/components';
import { STATUS_FILTER_OPTIONS, CARD_ACTION_KEYS, CAPABILITY_OPTIONS } from '@/constants';
import type { ActionFilters } from '@/interfaces';
import './ActionCatalogPage.css';

const { Title } = Typography;

export default function ActionCatalogPage() {
    const [searchValue, setSearchValue] = useState('');
    const [activeStatus, setActiveStatus] = useState<string>('all');
    const [activeCapability, setActiveCapability] = useState<string>('all');

    const { actions, statusCounts, categoryCounts, isLoading, setFilters, refetch } = useActions();

    /** Handle search input */
    const handleSearch = (value: string) => {
        setSearchValue(value);
        updateFilters(value, activeStatus, activeCapability);
    };

    /** Handle status filter click */
    const handleStatusFilter = (statusKey: string) => {
        setActiveStatus(statusKey);
        updateFilters(searchValue, statusKey, activeCapability);
    };

    /** Handle capability dropdown change */
    const handleCapabilityFilter = (capabilityValue: string) => {
        setActiveCapability(capabilityValue);
        updateFilters(searchValue, activeStatus, capabilityValue);
    };

    /** Apply all filters to the hook */
    const updateFilters = (search: string, status: string, capability: string) => {
        const newFilters: ActionFilters = {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            capability: capability !== 'all' ? capability : undefined,
        };
        setFilters(newFilters);
    };

    /** Handle action menu selections */
    const handleCardAction = (actionKey: string) => {
        if (actionKey === CARD_ACTION_KEYS.EDIT || actionKey === CARD_ACTION_KEYS.DELETE) {
            message.info('Coming in Phase 4.2...');
        } else {
            message.success('Action updated');
            refetch();
        }
    };

    return (
        <div className="action-catalog">
            {/* ── Page Header ── */}
            <div className="action-catalog__header">
                <Title level={3} className="action-catalog__title">Action Catalog</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => message.info('Coming in Phase 4.2...')}>
                    Create Action
                </Button>
            </div>

            {/* ── Search Bar & Quick Filters ── */}
            <div className="action-catalog__search-bar">
                <Input.Search
                    placeholder="Search actions by name, key, or description..."
                    size="large"
                    allowClear
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="action-catalog__search-input"
                />
                <Select
                    size="large"
                    value={activeCapability}
                    options={CAPABILITY_OPTIONS}
                    onChange={handleCapabilityFilter}
                    className="action-catalog__dropdown"
                />
            </div>

            {/* ── Main Content Area ── */}
            <div className="action-catalog__body">
                {/* ── Sidebar Filters ── */}
                <aside className="action-catalog__sidebar">
                    <div className="action-catalog__sidebar-section">
                        <div className="action-catalog__filter-title">Status</div>
                        {STATUS_FILTER_OPTIONS.map((option) => (
                            <StatusFilterItem
                                key={option.key}
                                filterKey={option.key}
                                label={option.label}
                                count={statusCounts[option.key] ?? 0}
                                isActive={activeStatus === option.key}
                                onClick={() => handleStatusFilter(option.key)}
                            />
                        ))}
                    </div>

                    <div className="action-catalog__sidebar-section">
                        <div className="action-catalog__filter-title">Categories</div>
                        {Object.entries(categoryCounts).map(([category, count]) => (
                            <StatusFilterItem
                                key={category}
                                filterKey={category}
                                label={category}
                                count={count}
                                isActive={false} // Category filtering clicking is out of scope for MVP, just showing counts
                                onClick={() => { }}
                            />
                        ))}
                    </div>
                </aside>

                {/* ── Card Grid ── */}
                <main className="action-catalog__grid-area">
                    {isLoading ? (
                        <div className="action-catalog__loading">
                            <Spin size="large" />
                        </div>
                    ) : actions.length === 0 ? (
                        <div className="action-catalog__empty">
                            <Empty description="No actions match your filters" />
                        </div>
                    ) : (
                        <div className="action-catalog__grid">
                            {actions.map((action) => (
                                <ActionCard
                                    key={action.id}
                                    action={action}
                                    onAction={handleCardAction}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
