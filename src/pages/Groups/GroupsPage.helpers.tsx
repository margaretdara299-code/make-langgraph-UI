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
            const res = await deleteVariable(variable.variableId);
            if (res.success) {
                message.success('Variable deleted');
                onSuccess();
            }
        },
    });
};

