/**
 * CreateConnectorModal — modal shell that renders the correct form
 * (API or Database) based on the active connector type.
 * Supports both Create and Edit modes.
 */

import { useState, useEffect } from 'react';
import { Modal, Form, message } from 'antd';
import type { CreateConnectorModalProps } from '@/interfaces';
import { CONNECTOR_TYPES } from '@/interfaces';
import { createConnector, updateConnector } from '@/services/connector.service';
import DatabaseConnectorForm from './DatabaseConnectorForm';
import ApiConnectorForm from './ApiConnectorForm';
import './CreateConnectorModal.css';

export default function CreateConnectorModal({
    isOpen,
    connectorType,
    connectorToEdit,
    onClose,
    onCreated,
}: CreateConnectorModalProps) {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = !!connectorToEdit;
    const isApi = connectorType === CONNECTOR_TYPES.API;
    const title = isEditMode
        ? `Edit ${isApi ? 'API' : 'Database'} Connector`
        : `Create ${isApi ? 'API' : 'Database'} Connector`;

    /** Pre-populate form when editing */
    useEffect(() => {
        if (isOpen && connectorToEdit) {
            form.setFieldsValue({
                name: connectorToEdit.name,
                description: connectorToEdit.description,
                configJson: connectorToEdit.configJson,
            });
        } else if (isOpen && !connectorToEdit) {
            form.resetFields();
        }
    }, [isOpen, connectorToEdit, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            if (isEditMode) {
                const result = await updateConnector(connectorToEdit!.connectorId, {
                    name: values.name,
                    connectorType,
                    description: values.description,
                    configJson: values.configJson,
                });
                if (result.success) {
                    message.success(result.message || `${isApi ? 'API' : 'Database'} connector updated successfully`);
                } else {
                    throw new Error(result.error);
                }
            } else {
                const result = await createConnector({
                    name: values.name,
                    connectorType,
                    description: values.description,
                    configJson: values.configJson,
                });
                if (result.success) {
                    message.success(result.message || `${isApi ? 'API' : 'Database'} connector created successfully`);
                } else {
                    throw new Error(result.error);
                }
            }

            form.resetFields();
            onCreated();
            onClose();
        } catch (error: any) {
            if (error?.errorFields) {
                return;
            }
            message.error(error?.message || `Failed to ${isEditMode ? 'update' : 'create'} connector. Please try again.`);
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
            title={title}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText={isEditMode ? 'Save' : 'Create'}
            confirmLoading={isSubmitting}
            width={640}
            destroyOnClose
            className="create-connector-modal"
        >
            {isApi ? (
                <ApiConnectorForm form={form} />
            ) : (
                <DatabaseConnectorForm form={form} />
            )}
        </Modal>
    );
}
