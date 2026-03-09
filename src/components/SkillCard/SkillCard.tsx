/**
 * SkillCard — displays a single skill as a card in the Skills Library grid.
 * Includes a dropdown action menu for Edit, Test, Publish, Archive, Delete.
 */

import { Card, Tag, Typography, Space, Tooltip, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
    ClockCircleOutlined,
    UserOutlined,
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
        <Card
            hoverable
            className="skill-card"
            onClick={onClick}
        >
            <div className="skill-card__header">
                <div className="skill-card__header-left">
                    <StatusPill status={skill.status} />
                    <Tag color="blue">{skill.environment.toUpperCase()}</Tag>
                </div>
                <Dropdown
                    menu={{ items: getMenuItems(skill.status), onClick: handleMenuClick }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <MoreOutlined
                        className="skill-card__actions-btn"
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            </div>

            <Text strong className="skill-card__name">{skill.name}</Text>
            <Text type="secondary" className="skill-card__key">{skill.skillKey}</Text>

            <Paragraph
                type="secondary"
                className="skill-card__description"
                ellipsis={{ rows: 2 }}
            >
                {skill.description}
            </Paragraph>

            <div className="skill-card__meta">
                <Space size={4}>
                    <TagOutlined className="skill-card__meta-icon" />
                    <Text type="secondary">{skill.category}</Text>
                </Space>
                <Space size={4}>
                    <UserOutlined className="skill-card__meta-icon" />
                    <Text type="secondary">{skill.owner}</Text>
                </Space>
            </div>

            <div className="skill-card__footer">
                <Tooltip title={`Last updated: ${updatedDate}`}>
                    <Space size={4}>
                        <ClockCircleOutlined className="skill-card__meta-icon" />
                        <Text type="secondary" className="skill-card__date">{updatedDate}</Text>
                    </Space>
                </Tooltip>

                <div className="skill-card__tags">
                    {skill.tags.slice(0, 2).map((tag) => (
                        <Tag key={tag} className="skill-card__tag">{tag}</Tag>
                    ))}
                    {skill.tags.length > 2 && (
                        <Tooltip title={skill.tags.slice(2).join(', ')}>
                            <Tag className="skill-card__tag">+{skill.tags.length - 2}</Tag>
                        </Tooltip>
                    )}
                </div>
            </div>
        </Card>
    );
}
