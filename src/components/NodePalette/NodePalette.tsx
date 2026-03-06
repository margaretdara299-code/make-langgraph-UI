/**
 * NodePalette — left panel with categorized, searchable, draggable action items.
 */

import { useState } from 'react';
import { Input, Collapse, Spin, Typography } from 'antd';
import { useActions } from '@/hooks';
import NodePaletteItem from '@/components/NodePaletteItem/NodePaletteItem';
import type { NodePaletteProps } from '@/interfaces';
import './NodePalette.css';

const { Text } = Typography;

export default function NodePalette({ className = '' }: NodePaletteProps) {
    const [search, setSearch] = useState('');
    // Hydrate the palette with all actions, ignoring default 12-item pagination
    const { actionsByCategory, isLoading } = useActions({ pageSize: 1000 });

    /** Filter actions by search query */
    const getFilteredCategories = () => {
        const q = search.toLowerCase();
        const result: Record<string, typeof actionsByCategory[string]> = {};

        for (const [category, actions] of Object.entries(actionsByCategory)) {
            const filtered = q
                ? actions.filter(
                    (a) =>
                        a.name.toLowerCase().includes(q) ||
                        a.actionKey.toLowerCase().includes(q)
                )
                : actions;

            if (filtered.length > 0) {
                result[category] = filtered;
            }
        }
        return result;
    };

    const filteredCategories = getFilteredCategories();
    const categoryKeys = Object.keys(filteredCategories);

    return (
        <aside className={`node-palette ${className}`}>
            <div className="node-palette__header">
                <Text strong className="node-palette__title">Node Library</Text>
                <Input.Search
                    placeholder="Search actions..."
                    size="small"
                    allowClear
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="node-palette__search"
                />
            </div>

            <div className="node-palette__body">
                {isLoading ? (
                    <div className="node-palette__loading">
                        <Spin size="small" />
                    </div>
                ) : categoryKeys.length === 0 ? (
                    <div className="node-palette__empty">
                        <Text type="secondary">No actions found</Text>
                    </div>
                ) : (
                    <Collapse
                        ghost
                        defaultActiveKey={categoryKeys}
                        items={categoryKeys.map((category) => ({
                            key: category,
                            label: (
                                <span className="node-palette__category-label">
                                    {category}
                                    <span className="node-palette__category-count">
                                        {filteredCategories[category].length}
                                    </span>
                                </span>
                            ),
                            children: filteredCategories[category].map((action) => (
                                <NodePaletteItem key={action.id} action={action} />
                            )),
                        }))}
                    />
                )}
            </div>
        </aside>
    );
}
