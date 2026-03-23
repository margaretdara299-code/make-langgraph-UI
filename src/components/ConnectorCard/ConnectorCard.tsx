/**
 * ConnectorCard — displays a single connector as a grid card.
 * Visually mirrors ActionCard with connector-specific fields.
 */

import { Card, Typography, Space, Dropdown, Tag, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { EllipsisOutlined, ApiOutlined, DatabaseOutlined } from '@ant-design/icons';
import { CONNECTOR_TYPES } from '@/interfaces';
import type { ConnectorCardProps } from '@/interfaces';
import './ConnectorCard.css';

const { Text, Title } = Typography;

export default function ConnectorCard({ connector, onAction }: ConnectorCardProps) {
    const menuItems: MenuProps['items'] = [
        { key: 'edit', label: 'Edit' },
        { type: 'divider' },
        { key: 'delete', label: 'Delete', danger: true },
    ];

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isApi = connector.connectorType === CONNECTOR_TYPES.API;
    const typeLabel = isApi ? 'API' : 'Database';
    const typeColor = isApi ? 'blue' : 'green';
    const TypeIcon = isApi ? ApiOutlined : DatabaseOutlined;

    /** Render a summary of the config for each type */
    const renderConfigSummary = () => {
        const config = connector.configJson;
        if (!config) return null;

        if (isApi) {
            return (
                <div className="connector-card__config">
                    {config.method && config.url && (
                        <Tooltip title={config.url}>
                            <Text code className="connector-card__config-item">
                                {config.method} {config.url}
                            </Text>
                        </Tooltip>
                    )}
                </div>
            );
        }

        // Database
        return (
            <div className="connector-card__config">
                {config.engine && (
                    <Tag className="connector-card__engine">{config.engine}</Tag>
                )}
                {config.host && (
                    <Tooltip title={`${config.host}:${config.port ?? ''}`}>
                        <Text type="secondary" className="connector-card__host">
                            {config.host}:{config.port ?? ''}
                        </Text>
                    </Tooltip>
                )}
                {config.database && (
                    <Text type="secondary"> / {config.database}</Text>
                )}
            </div>
        );
    };

    return (
        <Card className="connector-card" hoverable>
            {/* Header: Type Icon, Type Tag, and Menu */}
            <div className="connector-card__header">
                <Space size="middle">
                    <div className="connector-card__icon">
                        <TypeIcon />
                    </div>
                    <Tag color={typeColor}>{typeLabel}</Tag>
                </Space>
                <Dropdown
                    menu={{
                        items: menuItems,
                        onClick: (e) => onAction?.(e.key, connector.connectorId),
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <div className="connector-card__menu-trigger" onClick={(e) => e.stopPropagation()}>
                        <EllipsisOutlined />
                    </div>
                </Dropdown>
            </div>

            {/* Body: Name, Description, Config Summary */}
            <div className="connector-card__body">
                <Title level={5} className="connector-card__title" ellipsis>
                    {connector.name}
                </Title>
                <div className="connector-card__description">
                    <Text type="secondary" ellipsis>
                        {connector.description || 'No description'}
                    </Text>
                </div>
                {renderConfigSummary()}
            </div>

            {/* Footer: Status and Date */}
            <div className="connector-card__footer">
                <div className="connector-card__footer-top">
                    <Tag color={connector.isActive ? 'success' : 'default'}>
                        {connector.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                    <Tag className="connector-card__type-tag">{typeLabel}</Tag>
                </div>
                <div className="connector-card__date">
                    Edited {formatDate(connector.updatedAt)}
                </div>
            </div>
        </Card>
    );
}
