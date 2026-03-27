/**
 * CategoryCard — displays a single category as a grid card.
 */

import { Card, Typography, Dropdown } from 'antd';
import { EllipsisOutlined, AppstoreOutlined } from '@ant-design/icons';
import { CARD_MENU_ITEMS } from '@/constants/ui.constants';
import type { CategoryCardProps } from '@/interfaces';
import './CategoryCard.css';

const { Text, Title } = Typography;

export default function CategoryCard({ category, onAction }: CategoryCardProps) {
    const menuItems = CARD_MENU_ITEMS;

    return (
        <Card className="category-card" hoverable>
            <div className="category-card__header">
                <div className="category-card__icon">
                    <AppstoreOutlined />
                </div>
                <Dropdown
                    menu={{
                        items: menuItems,
                        onClick: (e) => onAction?.(e.key, (category as any).categoryId ?? category.category_id),
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <div className="category-card__menu-trigger" onClick={(e) => e.stopPropagation()}>
                        <EllipsisOutlined />
                    </div>
                </Dropdown>
            </div>

            <div className="category-card__body">
                <Title level={5} className="category-card__title" ellipsis>
                    {category.name}
                </Title>
                <div className="category-card__description">
                    <Text type="secondary" ellipsis>
                        {category.description || 'No description'}
                    </Text>
                </div>
            </div>
        </Card>
    );
}
