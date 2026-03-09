/**
 * StatusPill — thin wrapper around AntD Tag for skill/action status display.
 */

import { Tag } from 'antd';
import type { StatusPillProps } from '@/interfaces';
import { STATUS_CONFIG } from '@/constants';

export default function StatusPill({ status }: StatusPillProps) {
    const config = STATUS_CONFIG[status];
    return <Tag color={config.color}>{config.label}</Tag>;
}
