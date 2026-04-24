/**
 * DatabaseConnectorFields — reusable form items for Database connectors.
 * Separated from the Form wrapper to allow embedding in different contexts (Modal, Drawer).
 */

import { Form, Input, InputNumber, Select } from 'antd';
import { DB_ENGINE_OPTIONS } from '@/constants';
import './DatabaseConnectorFields.css';

export default function DatabaseConnectorFields() {
    return (
        <>
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
                name={['config_json', 'engine']}
                rules={[{ required: true, message: 'Please select a database engine' }]}
            >
                <Select placeholder="Select database engine" options={DB_ENGINE_OPTIONS} />
            </Form.Item>

            <Form.Item
                label="Host"
                name={['config_json', 'host']}
                rules={[{ required: true, message: 'Please enter the host' }]}
            >
                <Input placeholder="e.g. db.internal.local" />
            </Form.Item>

            <Form.Item
                label="Port"
                name={['config_json', 'port']}
                rules={[{ required: true, message: 'Please enter the port' }]}
            >
                <InputNumber placeholder="e.g. 5432" min={1} max={65535} className="dcf-full-width" />
            </Form.Item>

            <Form.Item
                label="User"
                name={['config_json', 'user']}
                rules={[{ required: true, message: 'Please enter the database user' }]}
            >
                <Input placeholder="e.g. orchestrator" />
            </Form.Item>

            <Form.Item
                label="Database"
                name={['config_json', 'database']}
                rules={[{ required: true, message: 'Please enter the database name' }]}
            >
                <Input placeholder="e.g. rcm_prod" />
            </Form.Item>
        </>
    );
}
