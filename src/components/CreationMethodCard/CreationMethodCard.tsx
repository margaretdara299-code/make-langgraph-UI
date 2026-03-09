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
    return (
        <Card
            hoverable
            className={`create-skill__method-card ${isSelected ? 'create-skill__method-card--selected' : ''}`}
            onClick={onClick}
        >
            {METHOD_ICONS[methodKey]}
            <Text strong className="create-skill__method-title">{title}</Text>
            <Paragraph type="secondary" className="create-skill__method-desc">
                {description}
            </Paragraph>
        </Card>
    );
}
