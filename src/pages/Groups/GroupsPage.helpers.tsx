import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { Variable } from '@/services/variables.service';
import type { Group } from '@/services/groups.service';
import { deleteGroup } from '@/services/groups.service';
import { deleteVariable } from '@/services/variables.service';


export const mapVariablesToGroups = (groups: Group[], variables: Variable[]) => {
    const mapping: Record<string, Variable[]> = {};
    groups.forEach(g => mapping[g.groupName] = []);
    if (!mapping['General']) mapping['General'] = [];

    variables.forEach(v => {
        const gName = v.groupName || 'General';
        if (!mapping[gName]) mapping[gName] = [];
        mapping[gName].push(v);
    });
    return mapping;
};

/**
 * Trigger confirmation modal for Group deletion.
 */
export const promptDeleteGroup = (group: Group, onSuccess: () => void) => {
    Modal.confirm({
        title: 'Delete Group',
        icon: <ExclamationCircleOutlined />,
        content: `Are you sure you want to delete the group "${group.groupName}"? This action cannot be undone.`,
        okText: 'Delete',
        okType: 'danger',
        centered: true,
        onOk: async () => {
            const res = await deleteGroup(group.groupId);
            if (res.success) {
                message.success('Group deleted successfully');
                onSuccess();
            } else {
                message.error(res.error || 'Failed to delete group');
            }
        },
    });
};

/**
 * Trigger confirmation modal for Variable deletion.
 */
export const promptDeleteVariable = (variable: Variable, onSuccess: () => void) => {
    Modal.confirm({
        title: 'Delete Variable',
        icon: <ExclamationCircleOutlined />,
        content: `Are you sure you want to delete "${variable.variableKey}"?`,
        okText: 'Delete',
        okType: 'danger',
        centered: true,
        onOk: async () => {
            const res = await deleteVariable(variable.groupKey, variable.variableKey);
            if (res.success) {
                message.success('Variable deleted');
                onSuccess();
            } else {
                message.error(res.error || 'Failed to delete variable');
            }
        },
    });
};

/**
 * Get columns configuration for the variables table.
 */
export const getVariableColumns = (onEdit: (v: Variable) => void, onDelete: (v: Variable) => void) => [
    {
        title: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>Name</span>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>Key</span>
            </div>
        ),
        key: 'nameKey',
        render: (_: any, record: Variable) => (
            <div className="gph-name-cell">
                <div className="gph-variable-name">{record.variableName}</div>
                <div className="gph-variable-key">{record.variableKey}</div>
            </div>
        ),
        width: '35%',
    },
    {
        title: 'Type',
        dataIndex: 'dataType',
        key: 'dataType',
        render: (type: string) => (
            <span className="gph-type-badge">
                {type}
            </span>
        ),
        width: '15%',
    },
    {
        title: 'Value',
        dataIndex: 'variableValue',
        key: 'variableValue',
        render: (val: string) => (
            <span className="gph-value-cell">
                {val}
            </span>
        ),
    },
    {
        title: '',
        key: 'actions',
        width: 80,
        render: (_: any, record: Variable) => (
            <div className="gph-actions-cell">
                <a onClick={() => onEdit(record)} className="gph-action-edit">Edit</a>
                <a onClick={() => onDelete(record)} className="gph-action-delete">Delete</a>
            </div>
        ),
    },
];
