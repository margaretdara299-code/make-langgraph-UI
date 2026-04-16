/**
 * CreateCategoryModal — modal for creating and editing categories.
 * High-fidelity, industry-level design refactor.
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Typography, Space } from 'antd';
import { createCategory, updateCategory } from '@/services/category.service';
import type { CreateCategoryModalProps } from '@/interfaces';

const { TextArea } = Input;
const { Text } = Typography;

export default function CreateCategoryModal({
    isOpen,
    categoryToEdit,
    onClose,
    onCreated,
}: CreateCategoryModalProps) {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!categoryToEdit;
    const nameValue = Form.useWatch('name', form);

    useEffect(() => {
        if (isOpen && categoryToEdit) {
            form.setFieldsValue({
                name: categoryToEdit.name,
                description: categoryToEdit.description,
            });
        } else if (isOpen && !categoryToEdit) {
            form.resetFields();
        }
    }, [isOpen, categoryToEdit, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            if (isEditMode) {
                const categoryId = (categoryToEdit as any).categoryId ?? categoryToEdit!.category_id;
                const result = await updateCategory(categoryId, values);
                if (result.success) {
                    message.success(result.message || 'Category updated successfully');
                } else {
                    throw new Error(result.error);
                }
            } else {
                const result = await createCategory(values);
                if (result.success) {
                    message.success(result.message || 'Category created successfully');
                } else {
                    throw new Error(result.error);
                }
            }

            form.resetFields();
            onCreated();
            onClose();
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error?.message || `Failed to ${isEditMode ? 'update' : 'create'} category.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={
                <Space direction="vertical" size={2} style={{ width: '100%', lineHeight: '1.2', paddingBottom: '12px' }}>
                    <Text style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', display: 'block', letterSpacing: '-0.02em' }}>
                        {isEditMode ? "Edit Category" : "Create New Category"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px', fontWeight: 400, display: 'block' }}>
                        {isEditMode ? "Modify category details and its organization" : "Define a new category to group related services"}
                    </Text>
                </Space>
            }
            open={isOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={isEditMode ? "Save Changes" : "Create Category"}
            confirmLoading={isSubmitting}
            width={480}
            zIndex={1300}
            centered
            destroyOnClose
            okButtonProps={{ 
                style: { height: '40px', fontWeight: 600, padding: '0 24px', borderRadius: '8px' },
                disabled: !nameValue || nameValue.trim().length < 3
            }}
            cancelButtonProps={{ 
                style: { height: '40px', padding: '0 24px', borderRadius: '8px' }
            }}
        >
            <div style={{ paddingTop: '12px' }}>
                <Form form={form} layout="vertical" requiredMark="optional">
                    <Form.Item
                        label="Category Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please enter a category name' },
                            { min: 3, message: 'Name must be at least 3 characters' }
                        ]}
                    >
                        <Input size="large" placeholder="e.g. AI & NLP, Automation, Data Processing" style={{ borderRadius: '4px' }} />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <TextArea 
                            size="large"
                            placeholder="Optional description of this category" 
                            rows={4} 
                            style={{ borderRadius: '4px', minHeight: '100px' }}
                            showCount
                            maxLength={200}
                        />
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}
