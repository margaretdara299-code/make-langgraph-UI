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
import StatusPill from '@/components/StatusPill/StatusPill';
import { getMenuItems } from '@/utils';
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
        <motion.div
            className="skill-card-premium"
            onClick={onClick}
            whileHover={{ y: -4, boxShadow: 'var(--shadow-md)', borderColor: 'var(--accent)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
            <div className="skill-card-header">
                <div className="header-badges">
                    <StatusPill status={skill.status} />
                    <div className="env-badge">{skill.environment.toUpperCase()}</div>
                </div>
                
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

            <div className="skill-card-body">
                <Text strong className="skill-name">{skill.name}</Text>
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
                    <TagOutlined className="meta-icon" />
                    <span>{skill.category}</span>
                </div>
                <div className="meta-item">
                    <BranchesOutlined className="meta-icon" />
                    <span className="version-text">v{skill.version || '1.0.0'}</span>
                </div>
            </div>

            <div className="skill-card-footer">
                <Tooltip title={`Last updated: ${updatedDate}`}>
                    <div className="updated-date">
                        <ClockCircleOutlined className="meta-icon" />
                        <span>{updatedDate}</span>
                    </div>
                </Tooltip>

                <div className="footer-tags">
                    {skill.tags.slice(0, 2).map((tag) => (
                        <div key={tag} className="mini-tag">{tag}</div>
                    ))}
                    {skill.tags.length > 2 && (
                        <Tooltip title={skill.tags.slice(2).join(', ')}>
                            <div className="mini-tag count">+{skill.tags.length - 2}</div>
                        </Tooltip>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
