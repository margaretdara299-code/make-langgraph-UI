import { useEffect, useState } from 'react';
import { Typography, Button, Table, Space, Popconfirm, message, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, DatabaseOutlined } from '@ant-design/icons';
import { fetchVariables, deleteVariable } from '@/services/variables.service';
import type { Variable } from '@/services/variables.service';
import CreateVariableDrawer from './CreateVariableDrawer';
import './VariablesPage.css';

const { Title, Text } = Typography;

export default function VariablesPage() {
    const [variables, setVariables] = useState<Variable[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingVariable, setEditingVariable] = useState<Variable | null>(null);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchVariables();
        setVariables(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: number) => {
        const res = await deleteVariable(id);
        if (res.success) {
            message.success('Variable deleted');
            loadData();
        } else {
            message.error(res.error || 'Failed to delete variable');
        }
    };

    const handleEdit = (variable: Variable) => {
        setEditingVariable(variable);
        setDrawerVisible(true);
    };

    const handleCreate = () => {
        setEditingVariable(null);
        setDrawerVisible(true);
    };

    // Grouping
    const groupedVariables = variables.reduce((acc, variable) => {
        const group = variable.group_name || 'General';
        if (!acc[group]) acc[group] = [];
        acc[group].push(variable);
        return acc;
    }, {} as Record<string, Variable[]>);

    const columns = [
        {
            title: 'Key Name',
            dataIndex: 'key_name',
            key: 'key_name',
            render: (text: string) => <Text style={{ fontFamily: 'monospace', fontWeight: 600 }}>{text}</Text>,
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (text: string) => <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>{text}</Text>,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, record: Variable) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Delete variable?"
                        description="This might break workflows that depend on it."
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const collapseItems = Object.entries(groupedVariables).map(([groupName, groupVars]) => ({
        key: groupName,
        label: <Text strong>{groupName} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 8 }}>({groupVars.length})</span></Text>,
        children: <Table dataSource={groupVars} columns={columns} rowKey="id" pagination={false} size="small" />
    }));

    return (
        <div className="variables-page">
            <div className="variables-header">
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        <DatabaseOutlined style={{ marginRight: 12, color: 'var(--accent)' }} />
                        Global Variables
                    </Title>
                    <Text type="secondary">Define constants securely passed to your LangGraph executions.</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Create Variable
                </Button>
            </div>

            {loading ? (
                <Table loading={true} dataSource={[]} columns={columns} />
            ) : Object.keys(groupedVariables).length === 0 ? (
                <div className="empty-state">
                    <DatabaseOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <Text type="secondary">No variables defined yet.</Text>
                </div>
            ) : (
                <Collapse 
                    items={collapseItems} 
                    defaultActiveKey={Object.keys(groupedVariables)} 
                    ghost 
                    className="variables-collapse" 
                />
            )}

            <CreateVariableDrawer
                visible={drawerVisible}
                variable={editingVariable}
                onClose={() => setDrawerVisible(false)}
                onSuccess={() => {
                    setDrawerVisible(false);
                    loadData();
                }}
            />
        </div>
    );
}
