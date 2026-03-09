/**
 * Badge — thin wrapper around AntD Tag for labeled badges.
 */

import { Tag } from 'antd';
import type { BadgeProps } from '@/interfaces';
import { BADGE_VARIANT_COLOR_MAP } from '@/constants';

export default function Badge({ children, variant = 'default' }: BadgeProps) {
    return <Tag color={BADGE_VARIANT_COLOR_MAP[variant]}>{children}</Tag>;
}
