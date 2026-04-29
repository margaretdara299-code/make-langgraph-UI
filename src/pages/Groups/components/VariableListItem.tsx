import { Tag, Tooltip, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Variable } from '@/services/variables.service';

interface VariableListItemProps {
    variable: Variable;
    onEdit: (variable: Variable) => void;
    onDelete: (variable: Variable) => void;
}

/**
 * Display row for a single variable within a group card.
 */
export const VariableListItem = ({ variable, onEdit, onDelete }: VariableListItemProps) => {
    return (
        <div className="variable-list-item">
            <div className="var-metadata-row-table">
                <div className="var-meta-column">
                    <div className="var-name-stack">
                        <div className="var-name">{variable.variableName}</div>
                        <div className="var-key-code">
                            {variable.variableKey}
                        </div>
                    </div>
                </div>
                <div className="var-meta-column">
                    <Tag className="variable-type-tag-neat">{variable.dataType}</Tag>
                </div>
                <div className="var-meta-column var-meta-value-col">
                    <Tooltip title={variable.variableValue}>
                        <span className="var-value-text">{variable.variableValue}</span>
                    </Tooltip>
                </div>
            </div>
            
            <div className="variable-item-actions var-item-actions-gap">
                <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => onEdit(variable)} 
                    className="var-action-btn-edit" 
                    size="small"
                />
                <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => onDelete(variable)} 
                    className="var-action-btn-delete" 
                    size="small"
                />
            </div>
        </div>
    );
};



