/**
 * Placeholder for the Action Catalog page.
 * Will be implemented in Phase 4 of the roadmap.
 */

import { useState } from 'react';
import { Input, Select, Button, Typography, Spin, Empty, message, Tabs, Badge, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useActions, useCategories, useCapabilities } from '@/hooks';
import { ActionCard, CreateActionModal } from '@/components';
import { ACTION_STATUS_FILTER_OPTIONS, CARD_ACTION_KEYS } from '@/constants';
import { fetchActionById } from '@/services/action.service';
import type { ActionFilters, ActionDefinition } from '@/interfaces';
import './ActionCatalogPage.css';

const { Title } = Typography;

export default function ActionCatalogPage() {
    const [searchValue, setSearchValue] = useState('');
    const [activeStatus, setActiveStatus] = useState<string>('all');
    const [activeCapability, setActiveCapability] = useState<string>('all');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [initialModalStep, setInitialModalStep] = useState(0);
    const [actionToEdit, setActionToEdit] = useState<ActionDefinition | undefined>(undefined);

    const { actions, statusCounts, categoryCounts, capabilityCounts, isLoading: isActionsLoading, setFilters, refetch } = useActions();
    const { categories, isLoading: isCategoriesLoading } = useCategories();
    const { capabilities, isLoading: isCapabilitiesLoading } = useCapabilities();

    /** Handle search input */
    const handleSearch = (value: string) => {
        setSearchValue(value);
        updateFilters(value, activeStatus, activeCapability, activeCategory);
    };

    /** Handle status filter click */
    const handleStatusFilter = (statusKey: string) => {
        setActiveStatus(statusKey);
        updateFilters(searchValue, statusKey, activeCapability, activeCategory);
    };

    /** Handle capability dropdown change */
    const handleCapabilityFilter = (capabilityValue: string) => {
        setActiveCapability(capabilityValue);
        updateFilters(searchValue, activeStatus, capabilityValue, activeCategory);
    };

    /** Handle category filter click */
    const handleCategoryFilter = (categoryKey: string) => {
        // Toggle off if clicking the already active category
        const newCategory = activeCategory === categoryKey ? 'all' : categoryKey;
        setActiveCategory(newCategory);
        updateFilters(searchValue, activeStatus, activeCapability, newCategory);
    };

    /** Apply all filters to the hook */
    const updateFilters = (search: string, status: string, capability: string, category: string) => {
        const newFilters: ActionFilters = {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            capability: capability !== 'all' ? capability : undefined,
            category: category !== 'all' ? category : undefined,
        };
        setFilters(newFilters);
    };

    /** Handle action menu selections */
    const handleCardAction = (actionKey: string, actionId: string) => {
        if (actionKey === CARD_ACTION_KEYS.EDIT_SETTINGS || actionKey === CARD_ACTION_KEYS.TEST) {
            // Fetch full action data with JSON blobs
            fetchActionById(actionId).then((result: Awaited<ReturnType<typeof fetchActionById>>) => {
                if (result.success) {
                    setActionToEdit(result.data);
                    setInitialModalStep(actionKey === CARD_ACTION_KEYS.TEST ? 1 : 0);
                    setIsCreateModalOpen(true);
                } else {
                    message.error(result.error || 'Failed to load action for editing');
                }
            }).catch(() => {
                message.error('Failed to load action for editing');
            });
        } else if (actionKey === CARD_ACTION_KEYS.DELETE) {
            message.info('Delete coming soon...');
        } else {
            refetch();
        }
    };

    return (
        <div className="action-catalog">
            <CreateActionModal
                isOpen={isCreateModalOpen}
                initialStep={initialModalStep}
                onClose={() => { setIsCreateModalOpen(false); setActionToEdit(undefined); setInitialModalStep(0); }}
                onCreated={() => refetch()}
                actionToEdit={actionToEdit}
            />

            {/* ── Page Header ── */}
            <div className="action-catalog__header">
                <Title level={3} className="action-catalog__title">Action Catalog</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsCreateModalOpen(true)}>
                    Create Action
                </Button>
            </div>

            {/* ── Search Bar & Quick Filters ── */}
            <div className="action-catalog__toolbar">
                <div className="action-catalog__search-row">
                    <Input.Search
                        placeholder="Search actions by name, key, or description..."
                        size="large"
                        allowClear
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="action-catalog__search-input"
                    />

                    <div className="action-catalog__toolbar-selects">
                         

                        <Select
                            size="large"
                            value={activeCategory}
                            onChange={handleCategoryFilter}
                            className="action-catalog__dropdown"
                            placeholder="All Categories"
                            loading={isCategoriesLoading}
                            options={[
                                { value: 'all', label: `All Categories (${Object.values(categoryCounts).reduce((a, b) => a + b, 0)})` },
                                ...categories.map((category:any) => ({
                                    value: (category.categoryId ?? category.id ?? 0).toString(),
                                    label: `${category.name}`
                                }))
                            ]}
                        />
                        <Select
                            size="large"
                            value={activeCapability}
                            onChange={handleCapabilityFilter}
                            className="action-catalog__dropdown"
                            placeholder="All Capabilities"
                            loading={isCapabilitiesLoading}
                            options={[
                                { value: 'all', label: `All Capabilities (${statusCounts['all'] || 0})` },
                                ...capabilities.map((capability:any) => ({
                                    value: capability.capabilityId.toString(),
                                    label: `${capability.name}`
                                }))
                            ]}
                        />
                    </div>
                </div>

                <div className="action-catalog__filter-bar">
                    <Tabs
                        activeKey={activeStatus}
                        onChange={handleStatusFilter}
                        className="action-catalog__tabs"
                        items={ACTION_STATUS_FILTER_OPTIONS.map((option) => ({
                            key: option.key,
                            label: (
                                <Space>
                                    <option.icon />
                                    <span>{option.label}</span>
                                        <Badge
                                            count={statusCounts[option.key] ?? 0}
                                            showZero
                                            color={activeStatus === option.key ? 'var(--color-primary)' : '#d9d9d9'}
                                            className="action-catalog__count-tag"
                                        />
                                </Space>
                            ),
                        }))}
                    />
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="action-catalog__body">

                {/* ── Card Grid ── */}
                <main className="action-catalog__grid-area">
                    {isActionsLoading ? (
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
