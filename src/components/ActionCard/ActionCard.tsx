/**
 * ActionCard — displays a single action definition as a grid card.
 */

import { Card, Typography, Space, Dropdown, Tag, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import StatusPill from '@/components/StatusPill/StatusPill';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import { CARD_ACTION_KEYS } from '@/constants';
import { stringToColorParams } from '@/utils';
import type { ActionCardProps } from '@/interfaces';
import './ActionCard.css';

const { Text, Title } = Typography;

export default function ActionCard({ action, onAction }: ActionCardProps) {
    // Dropdown menu items
    const menuItems: MenuProps['items'] = [
        { key: CARD_ACTION_KEYS.EDIT_SETTINGS, label: 'Edit' },
        { key: CARD_ACTION_KEYS.TEST, label: 'Test API' },
        { type: 'divider' },
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
        message: 'green',
    };

    const cap = (action.capability || 'default').toLowerCase();
    
    // Check if it's a known CSS capability class
    const isKnown = !!capabilityColors[cap];
    
    // If unknown, generate a deterministic color palette
    const dynamicTheme = isKnown ? null : stringToColorParams(cap);

    const iconColor = isKnown ? `var(--color-badge-text-${cap})` : dynamicTheme?.text;
    const tagBg = isKnown ? undefined : dynamicTheme?.bg;
    const tagTextColor = isKnown ? undefined : dynamicTheme?.text;

    return (
        <Card className="action-card" hoverable>
            {/* Header: Icon, Capability Tag, and Actions Menu */}
            <div className="action-card__header">
                <Space size="middle">
                    <div className="action-card__icon" style={{ color: iconColor }}>
                        <IconRenderer iconName={action.icon} size={20} />
                    </div>
                    <Tag 
                         color={isKnown ? capabilityColors[cap] : undefined}
                         style={!isKnown ? { backgroundColor: tagBg, color: tagTextColor, borderColor: tagTextColor } : undefined}
                    >
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
                <Tooltip title={action.action_key}>
                    <Text className="action-card__key" code ellipsis>
                        {action.action_key}
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
                    Edited {formatDate(action.updated_at)}
                </div>
            </div>
        </Card>
    );
}
