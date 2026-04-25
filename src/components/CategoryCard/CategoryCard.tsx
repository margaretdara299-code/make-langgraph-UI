/**
 * CategoryCard — displays a single category as a grid card.
 * Exact match to premium reference project.
 */

import { useState } from 'react';
import { Dropdown, Typography } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { CategoryCardProps } from '@/interfaces';
import { DynamicLucideIcon } from '../LucideIconPicker/LucideIconPicker';
import './CategoryCard.css';

const { Paragraph, Title } = Typography;

export default function CategoryCard({ category, onAction }: CategoryCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div
            className="category-card-premium"
            onDoubleClick={() => onAction?.('edit', (category as any).categoryId ?? category.category_id)}
        >
            <div className="cc-premium-header">
                <div className="ts-icon-container">
                    <DynamicLucideIcon name={category.icon || 'Folder'} size={18} />
                </div>
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
                            { type: 'divider' },
                            { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
                        ],
                        onClick: ({ domEvent, key }) => {
                            domEvent.stopPropagation();
                            setIsMenuOpen(false);
                            onAction?.(key as string, (category as any).categoryId ?? category.category_id);
                        }
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                    onOpenChange={(flag) => setIsMenuOpen(flag)}
                >
                    <button className="cc-menu-btn" onClick={(e) => e.stopPropagation()}>
                        <motion.div animate={{ rotate: isMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            <MoreOutlined />
                        </motion.div>
                    </button>
                </Dropdown>
            </div>

            <div className="cc-premium-body">
                <div className="category-name">{category.name}</div>
                <Paragraph
                    className="category-desc"
                    type="secondary"
                    ellipsis={{ rows: 3, tooltip: true }}
                >
                    {category.description || ''}
                </Paragraph>
            </div>
        </div>
    );
}
