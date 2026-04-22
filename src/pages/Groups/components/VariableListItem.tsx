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
            <div className="variable-item-main-stack">
                <div className="var-name-row">
                    <span className="var-name">{variable.variableName}</span>
                    <div className="variable-item-actions">
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
                <div className="var-metadata-row">
                    <div className="var-meta-item">
                        <span className="var-label">KEY</span>
                        <span className="var-key-code">{variable.variableKey}</span>
                    </div>
                    <div className="var-meta-item">
                        <span className="var-label">TYPE</span>
                        <Tag className="variable-type-tag-neat">{variable.dataType}</Tag>
                    </div>
                    <div className="var-meta-item var-meta-value">
                        <span className="var-label">VALUE</span>
                        <Tooltip title={variable.variableValue}>
                            <span className="var-value-text">{variable.variableValue}</span>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
};



