import { useState } from 'react';
import { Dropdown, Typography } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { DynamicLucideIcon } from '../LucideIconPicker/LucideIconPicker';
import type { Group } from '@/services/groups.service';
import './GroupCard.css';

const { Paragraph, Title } = Typography;

interface GroupCardProps {
    group: Group;
    onAction: (key: string, group: Group) => void;
}

export default function GroupCard({ group, onAction }: GroupCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div
            className="capability-card-premium"
            onDoubleClick={() => onAction('edit', group)}
        >
            <div className="cc-premium-header">
                <div className="cc-premium-icon-box">
                    <DynamicLucideIcon name={group.icon || 'Folder'} size={20} />
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
                            onAction(key as string, group);
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
                <Title level={5} className="capability-name">{group.groupName}</Title>
                <Paragraph
                    className="capability-desc"
                    type="secondary"
                    ellipsis={{ rows: 3, tooltip: true }}
                >
                    {group.description || 'No description provided.'}
                </Paragraph>
            </div>
        </div>
    );
}
