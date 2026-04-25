/**
 * CreateCategoryModal — modal for creating and editing categories.
 * High-fidelity, industry-level design refactor.
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Typography, Space, Button } from 'antd';
import { createCategory, updateCategory } from '@/services/category.service';
import type { CreateCategoryModalProps } from '@/interfaces';
import LucideIconPicker from '../LucideIconPicker/LucideIconPicker';
import './CreateCategoryModal.css';

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
                icon: categoryToEdit.icon || 'Folder'
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
                const categoryId = categoryToEdit!.categoryId;
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
            open={isOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={isEditMode ? "Save Changes" : "Create Category"}
            confirmLoading={isSubmitting}
            width={540}
            zIndex={1300}
            centered
            destroyOnHidden
            footer={null}
            className="create-category-modal-v2"
        >
            <div className="modal-header-neat ccm2-header">
                <div className="ccm2-header-inner">
                    <span className="modal-header-title">
                        {isEditMode ? "Edit Category" : "Create New Category"}
                    </span>
                    <span className="modal-header-subtitle">
                        {isEditMode ? "Modify category details and its organization" : "Define a new category to group related services"}
                    </span>
                </div>
            </div>

            <div className="ccm2-form-body">
                <Form form={form} layout="vertical" requiredMark>
                    <Form.Item
                        label="Category Name"
                        name="name"
                        rules={[
                            { required: true, whitespace: true, message: 'Category name is required' },
                            { min: 3, message: 'Name must be at least 3 characters long' }
                        ]}
                    >
                        <Input placeholder="e.g. AI & NLP, Automation" />
                    </Form.Item>

                    <div className="ccm2-icon-row">
                        <span className="ccm2-icon-label">Category Icon</span>
                        <Form.Item 
                            name="icon" 
                            rules={[{ required: true, message: 'Icon is required' }]}
                        >
                            <LucideIconPicker />
                        </Form.Item>
                    </div>

                    <Form.Item label="Description" name="description">
                        <TextArea 
                            placeholder="What is this category for?" 
                            rows={8} 
                            showCount
                            maxLength={200}
                        />
                    </Form.Item>
                </Form>
            </div>

            <div className="ccm2-footer">
                <Space size={12}>
                    <Button onClick={handleCancel} className="ccm2-btn">
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handleSubmit} 
                        loading={isSubmitting}
                        disabled={!nameValue || nameValue.trim().length < 3}
                        className="ccm2-btn ccm2-btn--primary"
                    >
                        {isEditMode ? "Save Changes" : "Create Category"}
                    </Button>
                </Space>
            </div>
        </Modal>
    );
}

