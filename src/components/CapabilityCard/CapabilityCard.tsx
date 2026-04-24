/**
 * CapabilityCard — displays a single capability as a grid card.
 * Exact match to premium reference project.
 */

import { useState } from 'react';
import { Dropdown, Typography } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, RocketOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { CapabilityCardProps } from '@/interfaces';
import './CapabilityCard.css';

const { Paragraph, Title } = Typography;

export default function CapabilityCard({ capability, onAction }: CapabilityCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div
            className="capability-card-premium"
            onDoubleClick={() => onAction?.('edit', (capability as any).capabilityId ?? capability.capability_id)}
        >
            <div className="cc-premium-header">
                <div className="cc-premium-icon-box">
                    <RocketOutlined className="capability-icon" />
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
                            onAction?.(key as string, (capability as any).capabilityId ?? capability.capability_id);
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
                <Title level={5} className="capability-name">{capability.name}</Title>
                <Paragraph
                    className="capability-desc"
                    type="secondary"
                    ellipsis={{ rows: 3, tooltip: true }}
                >
                    {capability.description || ''}
                </Paragraph>
            </div>
        </div>
    );
}
