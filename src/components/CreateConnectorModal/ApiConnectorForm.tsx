/**
 * ApiConnectorForm — form fields for creating an API connector.
 * Uses ApiConnectorFields for the actual form items.
 */

import { Form } from 'antd';
import ApiConnectorFields from './ApiConnectorFields';
import type { ApiConnectorFormProps } from '@/interfaces';

export default function ApiConnectorForm({ form }: ApiConnectorFormProps) {
    return (
        <Form
            form={form}
            layout="vertical"
            requiredMark
        >
            <ApiConnectorFields />
        </Form>
    );
}
