/**
 * CreationMethodCard — a single creation method option in the Create Skill wizard Step 2.
 */

import { Card, Typography } from 'antd';
import { METHOD_ICONS } from '@/constants';
import type { CreationMethodCardProps } from '@/interfaces';

const { Text, Paragraph } = Typography;

export default function CreationMethodCard({
    methodKey,
    title,
    description,
    isSelected,
    onClick,
}: CreationMethodCardProps) {
    const IconComponent = METHOD_ICONS[methodKey as keyof typeof METHOD_ICONS];

    return (
        <Card
            hoverable
            className={`create-skill__method-card ${isSelected ? 'create-skill__method-card--selected' : ''}`}
            onClick={onClick}
        >
            <IconComponent className="create-skill__method-icon" />
            <Text strong className="create-skill__method-title">{title}</Text>
            <Paragraph type="secondary" className="create-skill__method-desc">
                {description}
            </Paragraph>
        </Card>
    );
}
