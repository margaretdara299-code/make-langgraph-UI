/**
 * NodePalette — left panel with categorized, searchable, draggable action items.
 */

import { Collapse, Spin, Typography } from 'antd';
import { ThunderboltFilled, AppstoreFilled } from '@ant-design/icons';
import { useDesignerActions } from '@/hooks';
import NodePaletteItem from '@/components/NodePaletteItem/NodePaletteItem';
import StructureSection from './StructureSection';
import type { NodePaletteProps } from '@/interfaces';
import './NodePalette.css';

const { Text } = Typography;

export default function NodePalette({ className = '' }: NodePaletteProps) {
    const { actionsByCategory, isLoading } = useDesignerActions();

    const filteredCategories = actionsByCategory;
    const categoryKeys = Object.keys(filteredCategories);
    const totalActions = Object.values(filteredCategories).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <aside className={`node-palette ${className}`}>
            <div className="node-palette__header">
                <Text strong className="node-palette__title">Node Library</Text>
            </div>

            <div className="node-palette__body">
                {isLoading ? (
                    <div className="node-palette__loading">
                        <Spin size="small" />
                    </div>
                ) : (
                    <>
                        <Collapse
                            accordion
                            ghost
                            defaultActiveKey={undefined}
                            className="node-palette__root-collapse"
                            items={[
                                {
                                    key: 'common',
                                    label: (
                                        <span className="node-palette__section-label">
                                            <AppstoreFilled style={{ color: 'var(--node-palette-common-color)' }} /> Common
                                            <span className="node-palette__category-count">1</span>
                                        </span>
                                    ),
                                    children: <StructureSection search="" />,
                                },
                                {
                                    key: 'actions',
                                    label: (
                                        <span className="node-palette__section-label">
                                            <ThunderboltFilled style={{ color: 'var(--node-palette-actions-color)' }} /> Actions
                                            <span className="node-palette__category-count">{totalActions}</span>
                                        </span>
                                    ),
                                    children: categoryKeys.length === 0 ? (
                                        <div className="node-palette__empty">
                                            <Text type="secondary">No actions found</Text>
                                        </div>
                                    ) : (
                                        <Collapse
                                            accordion
                                            ghost
                                            defaultActiveKey={undefined}
                                            className="node-palette__child-collapse"
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
                                    ),
                                },
                            ]}
                        />
                    </>
                )}
            </div>
        </aside>
    );
}
