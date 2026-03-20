/**
 * DatabaseConnectorForm — form fields for creating a Database connector.
 */

import { Form, Input, InputNumber, Select } from 'antd';
import { DB_ENGINE_OPTIONS } from '@/constants';
import type { DatabaseConnectorFormProps } from '@/interfaces';


export default function DatabaseConnectorForm({ form }: DatabaseConnectorFormProps) {
    return (
        <Form
            form={form}
            layout="vertical"
            requiredMark
        >
            <Form.Item
                label="Connector Name"
                name="name"
                rules={[{ required: true, message: 'Please enter a connector name' }]}
            >
                <Input placeholder="e.g. Main SQL Engine" />
            </Form.Item>

            <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter a description' }]}
            >
                <Input.TextArea placeholder="e.g. Primary healthcare database" rows={2} />
            </Form.Item>

            <Form.Item
                label="Engine"
                name={['configJson', 'engine']}
                rules={[{ required: true, message: 'Please select a database engine' }]}
            >
                <Select placeholder="Select database engine" options={DB_ENGINE_OPTIONS} />
            </Form.Item>

            <Form.Item
                label="Host"
                name={['configJson', 'host']}
                rules={[{ required: true, message: 'Please enter the host' }]}
            >
                <Input placeholder="e.g. db.internal.local" />
            </Form.Item>

            <Form.Item
                label="Port"
                name={['configJson', 'port']}
                rules={[{ required: true, message: 'Please enter the port' }]}
            >
                <InputNumber placeholder="e.g. 5432" min={1} max={65535} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                label="User"
                name={['configJson', 'user']}
                rules={[{ required: true, message: 'Please enter the database user' }]}
            >
                <Input placeholder="e.g. orchestrator" />
            </Form.Item>

            <Form.Item
                label="Database"
                name={['configJson', 'database']}
                rules={[{ required: true, message: 'Please enter the database name' }]}
            >
                <Input placeholder="e.g. rcm_prod" />
            </Form.Item>
        </Form>
    );
}
