/**
 * ActionCard — displays a single action definition as a grid card.
 */

import { Card, Typography, Space, Dropdown, Tag, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import StatusPill from '@/components/StatusPill/StatusPill';
import { CARD_ACTION_KEYS } from '@/constants';
import type { ActionCardProps } from '@/interfaces';
import './ActionCard.css';

const { Text, Title } = Typography;

export default function ActionCard({ action, onAction }: ActionCardProps) {
    // Dropdown menu items
    const menuItems: MenuProps['items'] = [
        { key: CARD_ACTION_KEYS.EDIT, label: 'Edit' },
        ...(action.status === 'draft'
            ? [{ key: CARD_ACTION_KEYS.PUBLISH, label: 'Publish' }]
            : []),
        ...(action.status === 'published'
            ? [{ key: CARD_ACTION_KEYS.UNPUBLISH, label: 'Unpublish (Draft)' }]
            : []),
        { type: 'divider' },
        ...(action.status !== 'archived'
            ? [{ key: CARD_ACTION_KEYS.ARCHIVE, label: 'Archive' }]
            : []),
        { key: CARD_ACTION_KEYS.DELETE, label: 'Delete', danger: true },
    ];

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const capabilityColors: Record<string, string> = {
        api: 'blue',
        ai: 'purple',
        rpa: 'orange',
        human: 'cyan',
        rules: 'magenta',
    };

    return (
        <Card className="action-card" hoverable>
            {/* Header: Icon, Capability Tag, and Actions Menu */}
            <div className="action-card__header">
                <Space size="middle">
                    <div className="action-card__icon">{action.icon}</div>
                    <Tag color={capabilityColors[action.capability] || 'default'}>
                        {action.capability.toUpperCase()}
                    </Tag>
                </Space>
                <Dropdown
                    menu={{
                        items: menuItems,
                        onClick: (e) => onAction?.(e.key, action.id),
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <div className="action-card__menu-trigger" onClick={(e) => e.stopPropagation()}>
                        <EllipsisOutlined />
                    </div>
                </Dropdown>
            </div>

            {/* Body: Title, Key, and Description */}
            <div className="action-card__body">
                <Title level={5} className="action-card__title" ellipsis>
                    {action.name}
                </Title>
                <Tooltip title={action.actionKey}>
                    <Text className="action-card__key" code ellipsis>
                        {action.actionKey}
                    </Text>
                </Tooltip>
                <div className="action-card__description">
                    <Text type="secondary" ellipsis>{action.description}</Text>
                </div>
            </div>

            {/* Footer: Status, Category, and Date */}
            <div className="action-card__footer">
                <div className="action-card__footer-top">
                    <StatusPill status={action.status} />
                    <Tag className="action-card__category">{action.category}</Tag>
                </div>
                <div className="action-card__date">
                    Edited {formatDate(action.updatedAt)}
                </div>
            </div>
        </Card>
    );
}
