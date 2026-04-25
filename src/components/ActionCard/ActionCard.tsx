/**
 * ActionCard — Premium, high-density card architectural pattern.
 * Synchronized with the SkillCard design system.
 */

import { Typography, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    BuildOutlined,
} from '@ant-design/icons';
import { Tag as LucideTag } from 'lucide-react';

import StatusPill from '@/components/StatusPill/StatusPill';
import { DynamicLucideIcon } from '../LucideIconPicker/LucideIconPicker';
import type { ActionCardProps } from '@/interfaces';
import './ActionCard.css';

const { Text, Paragraph } = Typography;

export default function ActionCard({ action, onAction }: ActionCardProps) {
    const handleMenuClick: MenuProps['onClick'] = (e) => {
        e.domEvent.stopPropagation();
        onAction?.(e.key, action.id);
    };

    return (
        <div
            className="action-card-premium"
            onClick={() => onAction?.('edit', action.id)}
        >
            {/* Row 1: Name + Actions */}
            <div className="ac-header">
                <div className="ac-title-group">
                    <div className="ac-icon-container">
                        <DynamicLucideIcon name={action.icon} size={20} />
                    </div>
                    <Tooltip title={action.name} mouseEnterDelay={0.2}>
                        <Text strong className="ac-name">{action.name}</Text>
                    </Tooltip>
                </div>
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
                            { key: 'test', icon: <BuildOutlined />, label: 'Test API' },
                            { type: 'divider' },
                            { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
                        ],
                        onClick: handleMenuClick
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <div
                        className="ac-more-btn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreOutlined />
                    </div>
                </Dropdown>
            </div>

            {/* Row 2: Key + Status */}
            <div className="ac-key-row">
                <span className="ac-key-value">{action.action_key}</span>
                <StatusPill status={action.status || 'draft'} />
            </div>

            {/* Row 3: Description */}
            <div className="ac-body">
                <Tooltip title={action.description} mouseEnterDelay={0.2} placement="top">
                    <Paragraph
                        className="ac-description"
                        ellipsis={{ rows: 2 }}
                    >
                        {action.description || <span className="ac-empty-desc">No description available</span>}
                    </Paragraph>
                </Tooltip>
            </div>

            {/* Footer: Capability & Category + Tags */}
            <div className="ac-footer">
                <div className="ac-meta-section">
                    <Tooltip title={`Capability: ${action.capability || 'General'}`}>
                        <div className="ac-meta-pill ac-meta-pill--cap">
                            <DynamicLucideIcon name={action.capability_icon || 'Boxes'} size={11} />
                            <span>{action.capability || 'General'}</span>
                        </div>
                    </Tooltip>
                </div>

                <div className="ac-right-footer-group">
                    <Tooltip title={`Category: ${action.category || 'Common'}`}>
                        <div className="ac-meta-pill ac-meta-pill--cat">
                            <DynamicLucideIcon name={action.category_icon || 'Layout'} size={11} />
                            <span>{action.category || 'Common'}</span>
                        </div>
                    </Tooltip>

                    <div className="ac-tags-section">
                        {action.tags && action.tags.length > 0 && (
                            <div className="ac-mini-tag">
                                <LucideTag size={9} strokeWidth={2.5} />
                                {action.tags[0]}
                            </div>
                        )}
                        {action.tags && action.tags.length > 1 && (
                            <Tooltip title={action.tags.slice(1).join(', ')}>
                                <div className="ac-mini-tag ac-tag-count">+{action.tags.length - 1}</div>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
