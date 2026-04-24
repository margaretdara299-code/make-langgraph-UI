import { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message, Typography } from 'antd';
import { createGroup, updateGroup } from '@/services/groups.service';
import { LucideIconPicker } from '@/components/LucideIconPicker/LucideIconPicker';
import type { Group } from '@/services/groups.service';

const { Text } = Typography;

interface Props {
    visible: boolean;
    group: Group | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function GroupModal({ visible, group, onClose, onSuccess }: Props) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            if (group) {
                form.setFieldsValue({
                    group_key: group.groupKey,
                    groupName: group.groupName,
                    description: group.description,
                    icon: group.icon || 'Folder',
                });

            } else {
                form.resetFields();
            }
        }
    }, [visible, group, form]);

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                groupKey: values.group_key,
                groupName: values.groupName,
                description: values.description,
                icon: values.icon,
            };


            const res = await (group ? updateGroup(group.groupId, payload) : createGroup(payload));

            if (res.success) {
                message.success(group ? 'Group updated successfully' : 'Group created successfully');
                onSuccess();
                handleClose();
            } else {
                message.error(res.error || 'Operation failed');
            }
        } catch (e) {
            // Validation error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={handleClose}
            width={520}
            centered
            footer={null}
            destroyOnClose
            zIndex={2000}
            className="group-modal-neat"
        >
            <div className="modal-header-neat">
                <div className="gm-header-content">
                    <span className="modal-header-title">
                        {group ? 'Edit Group' : 'Create New Group'}
                    </span>
                    <span className="modal-header-subtitle">
                        {group ? 'Update organizational unit details.' : 'Define a new logical group for organization.'}
                    </span>
                </div>
            </div>

            <Form form={form} layout="vertical" requiredMark={false}>
                <Form.Item
                    name="groupName"
                    label={<Text strong>Group Name</Text>}
                    rules={[{ required: true, message: 'Please enter a group name' }]}
                >
                    <Input 
                        placeholder="e.g. Core Security Settings" 
                        className="gm-input-standard"
                    />
                </Form.Item>

                <Form.Item
                    name="group_key"
                    label={<Text strong>Group Key</Text>}
                    rules={[{ required: true, message: 'Please enter a group key' }]}
                    normalize={(val) => (val || '').toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')}
                    extra={<span className="gm-helper-text">Internal identifier (e.g. CORE_MODULE)</span>}
                >
                    <Input 
                        placeholder="e.g. SECURITY" 
                        className="variable-monospace-input gm-input-standard"
                    />
                </Form.Item>

                <Form.Item
                    name="icon"
                    label={<Text strong>Group Icon</Text>}
                    initialValue=""
                    rules={[{ required: true, message: 'Please select an icon' }]}
                >

                    <LucideIconPicker 
                        value={form.getFieldValue('icon')} 
                        onChange={(val) => form.setFieldsValue({ icon: val })} 
                    />
                </Form.Item>


                <Form.Item
                    name="description"
                    label={<Text strong>Description</Text>}
                >
                    <Input.TextArea 
                        rows={4} 
                        placeholder="What is the purpose of this group?" 
                        className="gm-textarea"
                    />
                </Form.Item>


                <div className="gm-footer-actions">
                    <Button onClick={handleClose} className="gm-cancel-btn">
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handleSubmit} 
                        loading={loading}
                        className="gm-submit-btn"
                    >
                        {group ? 'Save Changes' : 'Create Group'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
