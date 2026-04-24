/**
 * Connectors page — displays API and DB connectors with tabs, search, and grid.
 */

import { useState, useEffect, useCallback } from 'react';
import { Input, Button, Typography, Tabs, Empty, Spin, message, Modal } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { CONNECTOR_TAB_CONFIG } from '@/constants';
import { CONNECTOR_TYPES } from '@/interfaces';
import type { ConnectorTab, ConnectorResponse } from '@/interfaces';
import { fetchConnectors, deleteConnector } from '@/services/connector.service';
import ConnectorCard from '@/components/ConnectorCard/ConnectorCard';
import CreateConnectorModal from '@/components/CreateConnectorModal/CreateConnectorModal';
import './ConnectorsPage.css';

const { Title } = Typography;

export default function ConnectorsPage() {
    const [activeTab, setActiveTab] = useState<ConnectorTab>('api');
    const [searchValue, setSearchValue] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [connectors, setConnectors] = useState<ConnectorResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [connectorToEdit, setConnectorToEdit] = useState<ConnectorResponse | null>(null);

    const currentTabConfig = CONNECTOR_TAB_CONFIG.find((t) => t.key === activeTab)!;

    /** Fetch connectors from the backend */
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

    /** Filter connectors by active tab type and search query */
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

    /** Handle card action (edit / delete) */
    const handleCardAction = (actionKey: string, connectorId: number) => {
        const connector = connectors.find((connector) => connector.connectorId === connectorId);
        if (!connector) return;

        if (actionKey === 'edit') {
            setConnectorToEdit(connector);
            setIsModalOpen(true);
        } else if (actionKey === 'delete') {
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

    /** Open create modal (no edit) */
    const handleOpenCreate = () => {
        setConnectorToEdit(null);
        setIsModalOpen(true);
    };

    /** Close modal and reset edit state */
    const handleCloseModal = () => {
        setConnectorToEdit(null);
        setIsModalOpen(false);
    };

    return (
        <div className="connectors-page">
            {/* ── Page Header ── */}
            <div className="connectors-page__header">
                <Title level={3} className="connectors-page__title">Connectors</Title>
                <Button
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined />}
                    onClick={handleOpenCreate}
                    className="global-header-add-btn"
                />
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
                    {isLoading ? (
                        <div className="connectors-page__loading">
                            <Spin size="large" />
                        </div>
                    ) : filteredConnectors.length === 0 ? (
                        <div className="connectors-page__empty">
                            <Empty description={`No ${currentTabConfig.label}s yet. Click "${currentTabConfig.createLabel}" to add one.`} />
                        </div>
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

            {/* ── Create / Edit Connector Modal ── */}
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
