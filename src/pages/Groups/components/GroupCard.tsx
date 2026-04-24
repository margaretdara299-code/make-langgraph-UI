import { useState } from 'react';
import { Space, Button, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Folder } from 'lucide-react';
import type { Group } from '@/services/groups.service';
import type { Variable } from '@/services/variables.service';
import { VariableListItem } from './VariableListItem';
import { InlineVariableAdder } from './InlineVariableAdder';
import { InlineVariableEditor } from './InlineVariableEditor';

interface GroupCardProps {
    group: Group;
    variables: Variable[];
    onEditGroup: (group: Group) => void;
    onDeleteGroup: (group: Group) => void;
    onDeleteVariable: (variable: Variable) => void;
    refreshData: () => void;
}

/**
 * Main Group Card component that manages its own variable list and inline states.
 */
export const GroupCard = ({ 
    group, 
    variables, 
    onEditGroup, 
    onDeleteGroup, 
    onDeleteVariable,
    refreshData 
}: GroupCardProps) => {
    const [addingVariable, setAddingVariable] = useState(false);
    const [editingVariableKey, setEditingVariableKey] = useState<string | null>(null);

    return (
        <div className="group-card" key={group.groupName}>
            <div className="group-card-header">
                <div className="group-card-icon">
                    <Folder size={18} />
                </div>
                <div className="group-card-header-main" style={{ flex: 1 }}>
                    <div className="group-card-name-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span className="group-card-title">{group.groupName}</span>
                            <span className="group-card-subtitle">{group.groupKey}</span>
                        </div>
                        <div className="group-card-header-right">
                            <Space size="small">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={() => onEditGroup(group)}
                                />
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    onClick={() => onDeleteGroup(group)}
                                />
                            </Space>
                        </div>
                    </div>
                    {group.description && (
                        <p className="group-description-text">
                            {group.description}
                        </p>
                    )}
                </div>
            </div>


            <div className="group-card-body">
                {variables.length === 0 && !addingVariable && (
                    <div style={{ padding: '20px 0' }}>
                        <Empty description="No variables yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                )}
                
                <div className="group-variables-list">
                    <div className="variable-table-header">
                        <span className="var-column-header">Name / Key</span>
                        <span className="var-column-header">Type</span>
                        <span className="var-column-header">Value</span>
                    </div>
                    {variables.map(variable => (
                        editingVariableKey === variable.variableKey ? (
                            <InlineVariableEditor 
                                key={variable.variableKey} 
                                variable={variable} 
                                onUpdated={() => { 
                                    setEditingVariableKey(null); 
                                    refreshData(); 
                                }} 
                                onCancel={() => setEditingVariableKey(null)} 
                            />
                        ) : (
                            <VariableListItem 
                                key={variable.variableKey}
                                variable={variable}
                                onEdit={(v) => setEditingVariableKey(v.variableKey)}
                                onDelete={onDeleteVariable}
                            />
                        )
                    ))}

                    {addingVariable ? (
                        <div className="reveal-up">
                            <InlineVariableAdder 
                                groupName={group.groupName} 
                                groupKey={group.groupKey} 
                                onAdded={() => { 
                                    setAddingVariable(false); 
                                    refreshData(); 
                                }} 
                                onCancel={() => setAddingVariable(false)}
                            />
                        </div>
                    ) : (
                        <button 
                            className="add-variable-trigger-row"
                            onClick={() => setAddingVariable(true)}
                        >
                            <PlusOutlined style={{ fontSize: '12px' }} />
                            <span>Add Variable</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
