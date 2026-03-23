/**
 * DatabaseConnectorForm — form fields for creating a Database connector.
 * Uses DatabaseConnectorFields for the actual form items.
 */

import { Form } from 'antd';
import DatabaseConnectorFields from './DatabaseConnectorFields';
import type { DatabaseConnectorFormProps } from '@/interfaces';

export default function DatabaseConnectorForm({ form }: DatabaseConnectorFormProps) {
    return (
        <Form
            form={form}
            layout="vertical"
            requiredMark
        >
            <DatabaseConnectorFields />
        </Form>
    );
}
