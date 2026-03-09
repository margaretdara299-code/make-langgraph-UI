/**
 * StatusFilterItem — a single item in the sidebar status filter list.
 */

import { Space } from 'antd';
import { STATUS_ICONS } from '@/constants';
import type { StatusFilterItemProps } from '@/interfaces';
import './StatusFilterItem.css';

export default function StatusFilterItem({
    filterKey,
    label,
    count,
    isActive,
    onClick,
}: StatusFilterItemProps) {
    return (
        <div
            className={`status-filter-item ${isActive ? 'status-filter-item--active' : ''}`}
            onClick={onClick}
        >
            <Space size={8}>
                {STATUS_ICONS[filterKey]}
                <span>{label}</span>
            </Space>
            <span className="status-filter-item__count">
                {count}
            </span>
        </div>
    );
}
