/**
 * NodePalette — left panel with categorized, searchable, draggable action items.
 */

import { Collapse, Spin, Typography, Tag, Tooltip } from 'antd';
import { ThunderboltFilled, ApiFilled, AppstoreFilled, ApiOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useDesignerActions, useDesignerConnectors } from '@/hooks';
import NodePaletteItem from '@/components/NodePaletteItem/NodePaletteItem';
import StructureSection from './StructureSection';
import type { NodePaletteProps, ConnectorResponse } from '@/interfaces';
import './NodePalette.css';

const { Text } = Typography;

export default function NodePalette({ className = '' }: NodePaletteProps) {
    const { actionsByCategory, isLoading } = useDesignerActions();
    const { connectorsByType, isLoading: connectorsLoading } = useDesignerConnectors();

    const filteredCategories = actionsByCategory;
    const categoryKeys = Object.keys(filteredCategories);
    const totalActions = Object.values(filteredCategories).reduce((sum, arr) => sum + arr.length, 0);

    /** Count total connectors across all types */
    const connectorTypeKeys = Object.keys(connectorsByType);
    const totalConnectors = Object.values(connectorsByType).reduce((sum, arr) => sum + arr.length, 0);

    /** Map type key to display info */
    const getTypeIcon = (typeKey: string) => {
        const key = typeKey.toUpperCase();
        if (key === 'API') return <ApiOutlined />;
        return <DatabaseOutlined />;
    };

    const getTypeLabel = (typeKey: string) => {
        const key = typeKey.toUpperCase();
        if (key === 'API') return 'API';
        if (key === 'DATABASE') return 'Database';
        return typeKey;
    };

    /** Handle drag start for connector items */
    const handleConnectorDragStart = (e: React.DragEvent, connector: ConnectorResponse, typeKey: string) => {
        const isApi = typeKey.toUpperCase() === 'API';
        const dragData = JSON.stringify({
            nodeType: 'connector',
            connectorId: connector.connectorId,
            label: connector.name,
            description: connector.description || '',
            connectorType: typeKey.toLowerCase(),
            category: isApi ? 'API' : 'Database',
            capability: isApi ? 'api' : 'database',
            icon: isApi ? 'ApiOutlined' : 'DatabaseOutlined',
            configJson: connector.configJson,
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className={`node-palette ${className}`}>
            <div className="node-palette__header">
                <Text strong className="node-palette__title">Node Library</Text>
            </div>

            <div className="node-palette__body">
                {isLoading || connectorsLoading ? (
                    <div className="node-palette__loading">
                        <Spin size="small" />
                    </div>
                ) : (
                    <>
                        {/* ── Top-level Sections: Common, Actions & Connectors ── */}
                        <Collapse
                            accordion
                            ghost
                            defaultActiveKey={undefined}
                            className="node-palette__root-collapse"
                            items={[
                                {
                                    key: 'common',
                                    label: (
                                        <span className="node-palette__section-label">
                                            <AppstoreFilled style={{ color: 'var(--node-palette-common-color)' }} /> Common
                                            <span className="node-palette__category-count">1</span>
                                        </span>
                                    ),
                                    children: <StructureSection search="" />,
                                },
                                {
                                    key: 'actions',
                                    label: (
                                        <span className="node-palette__section-label">
                                            <ThunderboltFilled style={{ color: 'var(--node-palette-actions-color)' }} /> Actions
                                            <span className="node-palette__category-count">{totalActions}</span>
                                        </span>
                                    ),
                                    children: categoryKeys.length === 0 ? (
                                        <div className="node-palette__empty">
                                            <Text type="secondary">No actions found</Text>
                                        </div>
                                    ) : (
                                        <Collapse
                                            accordion
                                            ghost
                                            defaultActiveKey={undefined}
                                            className="node-palette__child-collapse"
                                            items={categoryKeys.map((category) => ({
                                                key: category,
                                                label: (
                                                    <span className="node-palette__category-label">
                                                        {category}
                                                        <span className="node-palette__category-count">
                                                            {filteredCategories[category].length}
                                                        </span>
                                                    </span>
                                                ),
                                                children: filteredCategories[category].map((action) => (
                                                    <NodePaletteItem key={action.id} action={action} />
                                                )),
                                            }))}
                                        />
                                    ),
                                },
                                {
                                    key: 'connectors',
                                    label: (
                                        <span className="node-palette__section-label">
                                            <ApiFilled style={{ color: 'var(--node-palette-connectors-color)' }} /> Connectors
                                            <span className="node-palette__category-count">{totalConnectors}</span>
                                        </span>
                                    ),
                                    children: connectorTypeKeys.length === 0 ? (
                                        <div className="node-palette__empty">
                                            <Text type="secondary">No connectors available</Text>
                                        </div>
                                    ) : (
                                        <Collapse
                                            accordion
                                            ghost
                                            defaultActiveKey={undefined}
                                            className="node-palette__child-collapse"
                                            items={connectorTypeKeys.map((typeKey) => ({
                                                key: typeKey,
                                                label: (
                                                    <span className="node-palette__category-label">
                                                        {getTypeIcon(typeKey)} {getTypeLabel(typeKey)}
                                                        <span className="node-palette__category-count">
                                                            {connectorsByType[typeKey].length}
                                                        </span>
                                                    </span>
                                                ),
                                                children: connectorsByType[typeKey].map((connector) => (
                                                    <div
                                                        key={connector.connectorId}
                                                        className="node-palette__connector-item"
                                                        draggable
                                                        onDragStart={(e) => handleConnectorDragStart(e, connector, typeKey)}
                                                    >
                                                        <div className="node-palette__connector-name">
                                                            <span className="node-palette__connector-icon">
                                                                {typeKey.toUpperCase() === 'API' ? <ApiOutlined /> : <DatabaseOutlined />}
                                                            </span>
                                                            <Text strong ellipsis style={{ fontSize: 13 }}>
                                                                {connector.name}
                                                            </Text>
                                                        </div>
                                                        {connector.description && (
                                                            <Tooltip title={connector.description}>
                                                                <Text type="secondary" ellipsis style={{ fontSize: 11 }}>
                                                                    {connector.description}
                                                                </Text>
                                                            </Tooltip>
                                                        )}
                                                        {connector.configJson && typeKey.toUpperCase() === 'API' && connector.configJson.method && (
                                                            <Tag style={{ fontSize: 10, marginTop: 2 }}>
                                                                {connector.configJson.method}
                                                            </Tag>
                                                        )}
                                                        {connector.configJson && typeKey.toUpperCase() === 'DATABASE' && connector.configJson.engine && (
                                                            <Tag color="green" style={{ fontSize: 10, marginTop: 2 }}>
                                                                {connector.configJson.engine}
                                                            </Tag>
                                                        )}
                                                    </div>
                                                )),
                                            }))}
                                        />
                                    ),
                                },
                            ]}
                        />
                    </>
                )}
            </div>
        </aside>
    );
}
