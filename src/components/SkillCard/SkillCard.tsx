/**
 * SkillCard — Premium, high-density card architectural pattern.
 * Uses div-based layout and framer-motion for industry-level feel.
 */

import { Typography, Tooltip, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
    MoreOutlined,
    PartitionOutlined,
} from '@ant-design/icons';
import { Tag as LucideTag, Layers } from 'lucide-react';
import StatusPill from '@/components/StatusPill/StatusPill';
import { getMenuItems, getTagStyle } from '@/utils';
import { getCategoryColor } from '@/utils/colorHelper';
import type { SkillCardProps } from '@/interfaces';
import './SkillCard.css';

const { Text, Paragraph } = Typography;

export default function SkillCard({ skill, onClick, onAction }: SkillCardProps) {
    const handleMenuClick: MenuProps['onClick'] = (e) => {
        e.domEvent.stopPropagation();
        onAction?.(e.key, skill.id);
    };

    return (
        <div
            className="skill-card-premium"
            onClick={onClick}
        >
            {/* Row 1: Name + Actions */}
            <div className="sc-header">
                <div className="sc-title-group">
                    <div className="ts-icon-container">
                        <PartitionOutlined className="sc-partition-icon" />
                    </div>
                    <div className="sc-name">{skill.name}</div>
                </div>
                <Dropdown
                    menu={{ items: getMenuItems(skill.status, skill.id, skill.latestVersionId), onClick: handleMenuClick }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <div
                        className="sc-more-btn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreOutlined />
                    </div>
                </Dropdown>
            </div>

            {/* Row 2: Key + Status */}
            <div className="sc-key-row">
                <span className="sc-key-value">{skill.skillKey}</span>
                <StatusPill status={skill.status} />
            </div>

            {/* Row 4: Description */}
            <div className="sc-body">
                <Paragraph
                    className="sc-description"
                    ellipsis={{ rows: 2, tooltip: skill.description ? { title: skill.description, mouseEnterDelay: 0.2, placement: "top" } : false }}
                >
                    {skill.description || <span className="sc-empty-desc">No description provided</span>}
                </Paragraph>
            </div>

            {/* Footer: Capabilities (Category) + Tags */}
            <div className="sc-footer">
                <Tooltip title={`Category: ${skill.category || 'General'}`} mouseEnterDelay={0.2}>
                    <div className="sc-cap-section">
                        <Layers size={12} strokeWidth={2.5} color={getCategoryColor(skill.category || 'General')} />
                        <span className="sc-cap-label">{skill.category || 'General'}</span>
                    </div>
                </Tooltip>

                <div className="sc-tags-section">
                    {skill.tags.slice(0, 1).map((tag) => {
                        const style = getTagStyle(tag);
                        return (
                            <div
                                key={tag}
                                className="sc-mini-tag"
                                style={{
                                    '--tag-bg': style.bg,
                                    '--tag-color': style.color,
                                } as React.CSSProperties}
                            >
                                <LucideTag size={9} strokeWidth={2.5} />
                                {tag}
                            </div>
                        );
                    })}
                    {skill.tags.length > 1 && (
                        <Tooltip title={skill.tags.slice(1).join(', ')}>
                            <div className="sc-mini-tag sc-tag-count">+{skill.tags.length - 1}</div>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
}
