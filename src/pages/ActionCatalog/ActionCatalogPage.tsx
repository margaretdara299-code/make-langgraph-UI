/**
 * ActionCatalogPage — High-fidelity replica of the premium design system.
 * Comprehensive library for browsing and managing action definitions.
 */

import { useState } from 'react';
import { message, Modal, Select, Button } from 'antd';
import { ExclamationCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useActions, useCategories, useCapabilities } from '@/hooks';
import {
    ActionCard,
    ActionCardSkeleton,
    Grid,
    CreateActionModal,
    SearchInput,
    CollectionEmptyState,
    CollectionPageHeader,
    CollectionPageTabs,
} from '@/components';
import { Plus } from 'lucide-react';
import { fetchActionById, deleteAction } from '@/services';
import { PAGE_HEADER_CONTENT } from '@/constants/ui.constants';
import './ActionCatalogPage.css';

const { ACTION_CATALOG } = PAGE_HEADER_CONTENT;

export default function ActionCatalogPage() {
    const [searchValue, setSearchValue] = useState('');
    const { 
        actions, 
        statusCounts, 
        isLoading, 
        filters, 
        setFilters,
        refetch,
        totalActions
    } = useActions();
    const { categories } = useCategories();
    const { capabilities } = useCapabilities();

    const [modalOpen, setModalOpen] = useState(false);
    const [actionToEdit, setActionToEdit] = useState<any>(null);
    const [initialStep, setInitialStep] = useState(0);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setFilters((prev) => ({ ...prev, search: value }));
    };

    const handleStatusFilter = (status: string) => {
        setFilters((prev) => ({ ...prev, status: status === 'all' ? undefined : status }));
    };

    const handleCategoryFilter = (categoryId: string) => {
        setFilters((prev) => ({ ...prev, category: categoryId === 'all' ? undefined : categoryId }));
    };

    const handleCapabilityFilter = (capabilityId: string) => {
        setFilters((prev) => ({ ...prev, capability: capabilityId === 'all' ? undefined : capabilityId }));
    };

    const handleAction = async (actionKey: string, actionId: string) => {
        if (actionKey === 'edit' || actionKey === 'test') {
            try {
                const response = await fetchActionById(actionId);
                if (response.success) {
                    setActionToEdit(response.data);
                    setInitialStep(actionKey === 'test' ? 1 : 0);
                    setModalOpen(true);
                } else {
                    message.error(response.error || 'Failed to load action details');
                }
            } catch (err) {
                message.error('Failed to load action details');
            }
        } else if (actionKey === 'delete') {
            Modal.confirm({
                title: 'Delete Action',
                icon: <ExclamationCircleOutlined />,
                content: 'Are you sure you want to delete this action? This cannot be undone.',
                okText: 'Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                centered: true,
                onOk: async () => {
                    try {
                        const result = await deleteAction(actionId);
                        if (result.success) {
                            message.success(result.message || 'Action deleted successfully');
                            refetch();
                        } else {
                            message.error(result.error || 'Failed to delete action');
                        }
                    } catch (err) {
                        message.error('Failed to delete action');
                    }
                },
            });
        }
    };

    return (
        <div className="action-catalog-page">
            <CollectionPageHeader
                title={ACTION_CATALOG.title}
                description={ACTION_CATALOG.description}
                action={(
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<Plus size={18} />}
                        onClick={() => {
                            setActionToEdit(null);
                            setInitialStep(0);
                            setModalOpen(true);
                        }}
                        className="global-header-add-btn"
                    />
                )}
                aside={(
                    <div className="catalog-filters-row">
                        <div className="catalog-search-wrap">
                            <SearchInput
                                placeholder="Search by name or key..."
                                value={searchValue}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="catalog-options-row">
                            <Select
                                className="catalog-filter-select"
                                placeholder="All Categories"
                                defaultValue="all"
                                onChange={handleCategoryFilter}
                                showSearch
                                optionFilterProp="label"
                                options={[
                                    { value: 'all', label: 'All Categories' },
                                    ...categories.map((c: any) => ({ value: c.categoryId?.toString() || '', label: c.name }))
                                ]}
                            />
                            <Select
                                className="catalog-filter-select"
                                placeholder="All Capabilities"
                                defaultValue="all"
                                onChange={handleCapabilityFilter}
                                showSearch
                                optionFilterProp="label"
                                options={[
                                    { value: 'all', label: 'All Capabilities' },
                                    ...capabilities.map((c: any) => ({ value: c.capabilityId?.toString() || '', label: c.name }))
                                ]}
                            />
                        </div>
                    </div>
                )}
                bottom={(
                    <CollectionPageTabs
                        activeKey={filters.status || 'all'}
                        onChange={handleStatusFilter}
                        items={[
                            { key: 'all', label: 'All' },
                            { key: 'published', label: 'Published' },
                            { key: 'draft', label: 'Draft' },
                        ]}
                    />
                )}
            />

            <div className="catalog-body">
                {actions.length === 0 && !isLoading ? (
                    <CollectionEmptyState
                        className="reveal-up"
                        icon={<SettingOutlined />}
                        title={searchValue ? 'No matching actions found' : 'Your action catalog is empty'}
                        description={
                            searchValue
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : 'Start by creating your first action to automate your workflow.'
                        }
                        action={searchValue ? (
                            <Button onClick={() => handleSearch('')}>Clear all filters</Button>
                        ) : (
                            <Button
                                type="primary"
                                icon={<Plus size={16} />}
                                onClick={() => setModalOpen(true)}
                            >
                                Create New Action
                            </Button>
                        )}
                    />
                ) : (
                    <Grid
                        isLoading={isLoading}
                        SkeletonComponent={ActionCardSkeleton}
                        data={actions}
                        gutter={[16, 16]}
                        autoFitMinWidth={280}
                        renderItem={(action) => (
                            <ActionCard
                                action={action}
                                onAction={handleAction}
                            />
                        )}
                    />
                )}
            </div>

            <CreateActionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={async () => {
                    await refetch();
                    setModalOpen(false);
                }}
                actionToEdit={actionToEdit}
                initialStep={initialStep}
            />
        </div>
    );
}
