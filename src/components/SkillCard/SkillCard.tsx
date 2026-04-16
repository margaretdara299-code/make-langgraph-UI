/**
 * SkillCard — Premium, high-density card architectural pattern.
 * Uses div-based layout and framer-motion for industry-level feel.
 */

import { Tag, Typography, Space, Tooltip, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { motion } from 'framer-motion';
import {
    ClockCircleOutlined,
    BranchesOutlined,
    TagOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { Tag as LucideTag, Layers } from 'lucide-react';
import StatusPill from '@/components/StatusPill/StatusPill';
import { getMenuItems, getTagStyle } from '@/utils';
import type { SkillCardProps } from '@/interfaces';
import './SkillCard.css';

const { Text, Paragraph } = Typography;

export default function SkillCard({ skill, onClick, onAction }: SkillCardProps) {
    const updatedDate = new Date(skill.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        e.domEvent.stopPropagation();
        onAction?.(e.key, skill.id);
    };

    return (
        <div
            className="skill-card-premium"
            onDoubleClick={onClick}
        >
            <div className="skill-card-header">
                <Text strong className="skill-name">{skill.name}</Text>
                <div className="header-right">
                    <StatusPill status={skill.status} />
                    <Dropdown
                        menu={{ items: getMenuItems(skill.status, skill.id, skill.latestVersionId), onClick: handleMenuClick }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <div
                            className="card-actions-trigger"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreOutlined />
                        </div>
                    </Dropdown>
                </div>
            </div>

            <div className="skill-card-body">
                <div className="skill-key-badge">{skill.skillKey}</div>

                <Paragraph
                    className="skill-description"
                    ellipsis={{ rows: 2 }}
                >
                    {skill.description}
                </Paragraph>
            </div>

            <div className="skill-card-meta">
                <div className="meta-item">
                    <Layers size={13} strokeWidth={2.5} color="#94A3B8" />
                    <span>{skill.category}</span>
                </div>
            </div>

            <div className="skill-card-footer">
                <div className="footer-tags">
                    {skill.tags.slice(0, 2).map((tag) => {
                        const style = getTagStyle(tag);
                        return (
                            <div
                                key={tag}
                                className="mini-tag"
                                style={{
                                    backgroundColor: style.bg,
                                    color: style.color,
                                    borderColor: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <LucideTag size={10} strokeWidth={2.5} />
                                {tag}
                            </div>
                        );
                    })}
                    {skill.tags.length > 2 && (
                        <Tooltip title={skill.tags.slice(2).join(', ')}>
                            <div className="mini-tag count" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>+{skill.tags.length - 2}</div>
                        </Tooltip>
                    )}
                </div>

                <Tooltip title={`Last updated: ${updatedDate}`}>
                    <div className="updated-date">
                        <ClockCircleOutlined className="meta-icon" />
                        <span>{updatedDate}</span>
                    </div>
                </Tooltip>
            </div>
        </div>
    );
}
