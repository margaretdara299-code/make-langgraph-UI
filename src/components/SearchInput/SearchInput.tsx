import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { SearchInputProps } from '@/interfaces';
import './SearchInput.css';

/**
 * SearchInput — Premium glassmorphism search component.
 * Mirrors the exact aesthetic of the reference project.
 */
export default function SearchInput({ 
    placeholder = 'Search...', 
    value, 
    onChange 
}: SearchInputProps) {
    return (
        <div className="premium-search-container">
            <Input
                placeholder={placeholder}
                prefix={<SearchOutlined className="search-icon" />}
                allowClear
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="premium-search-input"
            />
        </div>
    );
}
