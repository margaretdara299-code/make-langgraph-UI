/**
 * Connectors page - displays API and DB connectors with tabs, search, and grid.
 */

import { useState, useEffect, useCallback } from 'react';
import { Button, Spin, message, Modal } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { CONNECTOR_TAB_CONFIG } from '@/constants';
import { CONNECTOR_TYPES } from '@/interfaces';
import type { ConnectorTab, ConnectorResponse } from '@/interfaces';
import { fetchConnectors, deleteConnector } from '@/services/connector.service';
import {
    ConnectorCard,
    CreateConnectorModal,
    SearchInput,
    CollectionEmptyState,
    CollectionPageHeader,
    CollectionPageTabs,
} from '@/components';
import './ConnectorsPage.css';

export default function ConnectorsPage() {
    const [activeTab, setActiveTab] = useState<ConnectorTab>('api');
    const [searchValue, setSearchValue] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [connectors, setConnectors] = useState<ConnectorResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [connectorToEdit, setConnectorToEdit] = useState<ConnectorResponse | null>(null);

    const currentTabConfig = CONNECTOR_TAB_CONFIG.find((t) => t.key === activeTab)!;

    const loadConnectors = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchConnectors();
            setConnectors(data);
        } catch {
            message.error('Failed to fetch connectors');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConnectors();
    }, [loadConnectors]);

    const getFilteredConnectors = () => {
        const tabType = activeTab === 'api' ? CONNECTOR_TYPES.API : CONNECTOR_TYPES.DATABASE;
        let filtered = connectors.filter((connector) => connector.connectorType === tabType);

        if (searchValue.trim()) {
            const query = searchValue.toLowerCase();
            filtered = filtered.filter(
                (connector) =>
                    connector.name.toLowerCase().includes(query) ||
                    (connector.description ?? '').toLowerCase().includes(query)
            );
        }

        return filtered;
    };

    const filteredConnectors = getFilteredConnectors();

    const handleCardAction = (actionKey: string, connectorId: number) => {
        const connector = connectors.find((item) => item.connectorId === connectorId);
        if (!connector) return;

        if (actionKey === 'edit') {
            setConnectorToEdit(connector);
            setIsModalOpen(true);
            return;
        }

        if (actionKey === 'delete') {
            Modal.confirm({
                title: 'Delete Connector',
                icon: <ExclamationCircleOutlined />,
                content: `Are you sure you want to delete "${connector.name}"? This action cannot be undone.`,
                okText: 'Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: async () => {
                    try {
                        const result = await deleteConnector(connectorId);
                        if (result.success) {
                            message.success(result.message || 'Connector deleted successfully');
                            loadConnectors();
                        } else {
                            message.error(result.error || 'Failed to delete connector');
                        }
                    } catch (error: any) {
                        message.error(error?.message || 'Failed to delete connector');
                    }
                },
            });
        }
    };

    const handleOpenCreate = () => {
        setConnectorToEdit(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setConnectorToEdit(null);
        setIsModalOpen(false);
    };

    return (
        <div className="connectors-page">
            <CollectionPageHeader
                title="Connectors"
                description="Manage API and database connectors used across your action and workflow catalog."
                action={(
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreate}
                        className="global-header-add-btn"
                    />
                )}
                bottom={(
                    <CollectionPageTabs
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key as ConnectorTab)}
                        items={CONNECTOR_TAB_CONFIG.map((tab) => ({
                            key: tab.key,
                            label: tab.label,
                        }))}
                        trailing={(
                            <div className="connectors-page__search">
                                <SearchInput
                                    placeholder="Search connectors by name or description..."
                                    value={searchValue}
                                    onChange={setSearchValue}
                                />
                            </div>
                        )}
                    />
                )}
            />

            <div className="connectors-page__body">
                <main className="connectors-page__grid-area">
                    {isLoading ? (
                        <div className="connectors-page__loading">
                            <Spin size="large" />
                        </div>
                    ) : filteredConnectors.length === 0 ? (
                        <CollectionEmptyState
                            className="connectors-page__empty"
                            icon={<PlusOutlined />}
                            title={`No ${currentTabConfig.label}s yet`}
                            description={`Click "${currentTabConfig.createLabel}" to add your first ${currentTabConfig.label.toLowerCase()}.`}
                            action={(
                                <Button type="primary" onClick={handleOpenCreate}>
                                    {currentTabConfig.createLabel}
                                </Button>
                            )}
                        />
                    ) : (
                        <div className="connectors-page__grid">
                            {filteredConnectors.map((connector) => (
                                <ConnectorCard
                                    key={connector.connectorId}
                                    connector={connector}
                                    onAction={handleCardAction}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <CreateConnectorModal
                isOpen={isModalOpen}
                connectorType={connectorToEdit?.connectorType as any ?? currentTabConfig.connectorType}
                connectorToEdit={connectorToEdit}
                onClose={handleCloseModal}
                onCreated={() => {
                    handleCloseModal();
                    loadConnectors();
                }}
            />
        </div>
    );
}
