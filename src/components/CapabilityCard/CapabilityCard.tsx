/**
 * CapabilityCard — displays a single capability as a grid card.
 */

import { Card, Typography, Dropdown } from 'antd';
import { EllipsisOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { CARD_MENU_ITEMS } from '@/constants/ui.constants';
import type { CapabilityCardProps } from '@/interfaces';
import './CapabilityCard.css';

const { Text, Title } = Typography;

export default function CapabilityCard({ capability, onAction }: CapabilityCardProps) {
    const menuItems = CARD_MENU_ITEMS;

    return (
        <Card className="capability-card" hoverable>
            <div className="capability-card__header">
                <div className="capability-card__icon">
                    <ThunderboltOutlined />
                </div>
                <Dropdown
                    menu={{
                        items: menuItems,
                        onClick: (e) => onAction?.(e.key, (capability as any).capabilityId ?? capability.capability_id),
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <div className="capability-card__menu-trigger" onClick={(e) => e.stopPropagation()}>
                        <EllipsisOutlined />
                    </div>
                </Dropdown>
            </div>

            <div className="capability-card__body">
                <Title level={5} className="capability-card__title" ellipsis>
                    {capability.name}
                </Title>
                <div className="capability-card__description">
                    <Text type="secondary" ellipsis>
                        {capability.description || 'No description'}
                    </Text>
                </div>
            </div>
        </Card>
    );
}
