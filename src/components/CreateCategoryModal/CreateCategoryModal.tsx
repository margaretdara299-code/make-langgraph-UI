/**
 * CreateCategoryModal — modal for creating and editing categories.
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { createCategory, updateCategory } from '@/services/category.service';
import type { CreateCategoryModalProps } from '@/interfaces';

export default function CreateCategoryModal({
    isOpen,
    categoryToEdit,
    onClose,
    onCreated,
}: CreateCategoryModalProps) {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!categoryToEdit;

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
                const result = await updateCategory(categoryToEdit!.category_id, values);
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
            title={isEditMode ? 'Edit Category' : 'Create Category'}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={isEditMode ? 'Save' : 'Create'}
            confirmLoading={isSubmitting}
            width={520}
            destroyOnClose
        >
            <Form form={form} layout="vertical" requiredMark>
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter a category name' }]}
                >
                    <Input placeholder="e.g. AI & NLP" />
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <Input.TextArea placeholder="Optional description" rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
}
