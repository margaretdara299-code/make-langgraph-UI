/**
 * SearchInput — thin wrapper around AntD Input.Search.
 */

import { Input } from 'antd';
import type { SearchInputProps } from '@/interfaces';

const { Search } = Input;

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
}: SearchInputProps) {
    return (
        <Search
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            allowClear
        />
    );
}
