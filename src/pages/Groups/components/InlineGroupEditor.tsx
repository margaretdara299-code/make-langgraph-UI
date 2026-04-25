import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Input, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { updateGroup } from '@/services/groups.service';
import { LucideIconPicker, DynamicLucideIcon } from '@/components/LucideIconPicker/LucideIconPicker';
import type { Group } from '@/services/groups.service';

import { GROUP_VALIDATION } from '@/constants';

interface InlineGroupEditorProps {
    group: Group;
    onUpdated: () => void;
    onCancel: () => void;
}

/**
 * Inline editor that replaces the Group Card display with a form.
 */
export const InlineGroupEditor = ({ group, onUpdated, onCancel }: InlineGroupEditorProps) => {
    const [name, setName] = useState(group.groupName);
    const [key, setKey] = useState(group.groupKey);
    const [description, setDescription] = useState(group.description || '');
    const [icon, setIcon] = useState(group.icon || 'Folder');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});


    const handleUpdate = async () => {
        const trimmedName = name.trim();
        const trimmedKey = key.trim() || trimmedName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        
        const newErrors: Record<string, string> = {};
        if (!trimmedName) newErrors.name = GROUP_VALIDATION.NAME_REQUIRED;
        if (!trimmedKey) newErrors.key = GROUP_VALIDATION.KEY_REQUIRED;
        if (!icon) newErrors.icon = GROUP_VALIDATION.ICON_REQUIRED;


        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        const res = await updateGroup(group.groupId, { 
            groupName: trimmedName, 
            groupKey: trimmedKey,
            description: description.trim() || null,
            icon: icon
        });

        setLoading(false);
        
        if (res.success) {
            message.success('Group updated successfully');
            onUpdated();
        } else {
            message.error(res.error || 'Failed to update group');
        }
    };

    return (
        <div className="group-card editing-group-card reveal-up ige-root">
            <div className="group-card-header ige-header">
                <div className="ige-header-left">
                    <div className="group-card-icon ige-icon">
                        <DynamicLucideIcon name={icon} size={16} />
                    </div>
                    <span className="ige-title">Editing Group</span>
                </div>

                <Space size={4}>
                    <Button 
                        type="primary" 
                        size="small"
                        icon={<CheckOutlined />} 
                        onClick={handleUpdate} 
                        loading={loading} 
                        className="ige-action-btn"
                    />
                    <Button 
                        size="small"
                        icon={<CloseOutlined />} 
                        onClick={onCancel} 
                        className="ige-action-btn"
                    />
                </Space>
            </div>
            
            <div className="group-card-body ige-body">
                <div className="ige-fields-row">
                    <div className="group-icon-picker-inline ige-picker-wrap">
                        <div className={`ige-picker-border ${errors.icon ? 'ige-picker-border--error' : ''}`}>
                            <LucideIconPicker value={icon} onChange={(val) => { setIcon(val); if (errors.icon) setErrors(prev => ({ ...prev, icon: '' })); }} />
                        </div>
                        {errors.icon && <div className="validation-msg-tiny ige-validation-msg">Required</div>}
                    </div>
                    <div className="ige-name-field">

                        <Input 
                            variant="filled"
                            placeholder="Group Name" 
                            size="small"
                            className="ige-input-name"
                            status={errors.name ? 'error' : ''}
                            value={name}
                            onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: '' })); }}
                        />
                        {errors.name && <div className="validation-msg-tiny">{errors.name}</div>}
                    </div>
                    <div className="ige-key-field">
                        <Input 
                            variant="filled"
                            placeholder="KEY" 
                            size="small"
                            className="ige-input-key"
                            status={errors.key ? 'error' : ''}
                            value={key}
                            onChange={e => { setKey(e.target.value); if (errors.key) setErrors(prev => ({ ...prev, key: '' })); }}
                        />
                        {errors.key && <div className="validation-msg-tiny">{errors.key}</div>}
                    </div>
                </div>

                
                <div className="ige-description-wrap">
                    <Input.TextArea 
                        variant="filled"
                        size="small"
                        placeholder="Brief description..." 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        className="ige-textarea"
                    />
                </div>
            </div>
        </div>
    );
};
