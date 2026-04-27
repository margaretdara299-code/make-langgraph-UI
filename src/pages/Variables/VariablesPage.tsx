import { useEffect, useState, useMemo, useCallback } from 'react';
import { 
    Typography, 
    Button, 
    Table, 
    message, 
    Empty, 
    Spin, 
    Collapse,
    Tooltip,
    Popconfirm,
    Input
} from 'antd';
import { 
    PlusOutlined, 
    SearchOutlined
} from '@ant-design/icons';
import { fetchVariables, deleteVariable } from '@/services/variables.service';
import type { Variable } from '@/services/variables.service';
import VariableModal from './VariableModal';
import { mapVariablesToGroups } from '../Groups/GroupsPage.helpers';
import { PAGE_HEADER_CONTENT } from '@/constants/ui.constants';
import { Layers, Braces, AlignLeft, Hash, Edit2, Trash2, KeyRound, ToggleLeft } from 'lucide-react';
import './VariablesPage.css';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { VARIABLES } = PAGE_HEADER_CONTENT;

export default function VariablesPage() {
    const [variables, setVariables] = useState<Variable[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchVariables();
            setVariables(data);
        } catch (err) {
            message.error('Failed to load variables');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filteredVariables = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return variables;
        return variables.filter(v => 
            v.variableName.toLowerCase().includes(query) || 
            v.variableKey.toLowerCase().includes(query) ||
            v.groupName?.toLowerCase().includes(query)
        );
    }, [variables, search]);

    const groupedData = useMemo(() => {
        const uniqueGroups = Array.from(new Set(filteredVariables.map(v => v.groupName || 'General'))).map(name => ({
            groupName: name,
            groupKey: (filteredVariables.find(v => v.groupName === name)?.groupKey || name).toUpperCase()
        }));
        return mapVariablesToGroups(uniqueGroups as any, filteredVariables);
    }, [filteredVariables]);

    const handleCreate = () => {
        setEditingVariable(null);
        setModalVisible(true);
    };

    const handleEdit = (v: Variable) => {
        setEditingVariable(v);
        setModalVisible(true);
    };

    const handleDelete = async (v: Variable) => {
        const res = await deleteVariable(v.groupKey, v.variableKey);
        if (res.success) {
            message.success('Variable deleted');
            loadData();
        } else {
            message.error(res.error || 'Failed to delete variable');
        }
    };

    const columns = useMemo(() => [
        {
            title: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>Name</span>
                    <span style={{ fontSize: '10px', opacity: 0.6 }}>Key</span>
                </div>
            ),
            dataIndex: 'variableName',
            key: 'variableName',
            width: '35%',
            render: (text: string, record: Variable) => (
                <div className="var-name-cell">
                    <div className="var-name-text">{text}</div>
                    <div className="var-key-text">
                        <KeyRound size={12} className="var-key-icon" /> 
                        {record.variableKey}
                    </div>
                </div>
            )
        },
        {
            title: 'Type',
            dataIndex: 'dataType',
            key: 'dataType',
            width: '20%',
            render: (type: string) => {
                let Icon = AlignLeft;
                if (type === 'number') Icon = Hash;
                if (type === 'json') Icon = Braces;
                if (type === 'boolean') Icon = ToggleLeft;

                return (
                    <div className="var-type-cell">
                        <div className="var-type-badge">
                            <Icon size={14} className="var-type-icon" />
                            <span>{type}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Value',
            dataIndex: 'variableValue',
            key: 'variableValue',
            width: '35%',
            render: (val: string, record: Variable) => {
                const displayVal = val !== undefined && val !== null && val !== '' ? String(val) : null;
                return (
                    <div className="var-value-cell">
                        <div className="var-value-content">
                            {displayVal ? displayVal : <span className="var-value-empty">Not set</span>}
                        </div>
                    </div>
                );
            }
        },
        {
            title: '',
            key: 'actions',
            width: '10%',
            align: 'right' as const,
            render: (_: any, record: Variable) => (
                <div className="var-actions-cell">
                    <Tooltip title="Edit Variable">
                        <Button 
                            type="text" 
                            icon={<Edit2 size={16} />} 
                            className="var-action-btn edit-btn" 
                            onClick={() => handleEdit(record)} 
                        />
                    </Tooltip>
                    <Popconfirm 
                        title="Delete Variable" 
                        description={`Delete ${record.variableKey}?`}
                        onConfirm={() => handleDelete(record)}
                        okText="Yes"
                        cancelText="No"
                        placement="topRight"
                    >
                        <Tooltip title="Delete Variable">
                            <Button 
                                type="text" 
                                danger 
                                icon={<Trash2 size={16} />} 
                                className="var-action-btn delete-btn" 
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>
            )
        }
    ], [loadData]);

    return (
        <div className="variables-page reveal-up">
            <header className="variables-header">
                <div className="title-section">
                    <Title level={2} className="var-page-title">{VARIABLES.title}</Title>
                    <Text type="secondary" className="var-page-subtitle">{VARIABLES.description}</Text>
                </div>
                <div className="var-header-actions">
                    <Input 
                        prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
                        placeholder="Search variables..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="var-search-input"
                        allowClear
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="var-create-btn">
                        New Variable
                    </Button>
                </div>
            </header>

            <div className="variables-body">
                {loading ? (
                    <div className="var-loading-state"><Spin size="large" /></div>
                ) : variables.length === 0 && !search ? (
                    <div className="var-empty-state">
                        <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            description="No variables defined yet"
                        >
                            <Button type="primary" onClick={handleCreate}>Create your first variable</Button>
                        </Empty>
                    </div>
                ) : Object.keys(groupedData).length === 0 ? (
                    <div className="var-empty-state">
                        <Empty description={`No variables match "${search}"`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                ) : (
                    <div className="variables-accordion-container">
                        <Collapse accordion ghost expandIconPosition="end" defaultActiveKey={Object.keys(groupedData)} className="variables-main-accordion">
                            {Object.entries(groupedData).map(([groupName, items]) => (
                                <Panel 
                                    header={
                                        <div className="accordion-group-header">
                                            <div className="accordion-group-left">
                                                <div className="accordion-group-icon"><Layers size={16} /></div>
                                                <span className="accordion-group-title">{groupName}</span>
                                            </div>
                                            <div className="accordion-group-right">
                                                <div className="neat-count-badge">
                                                    {items.length} {items.length === 1 ? 'variable' : 'variables'}
                                                </div>
                                            </div>
                                        </div>
                                    } 
                                    key={groupName}
                                >
                                    <div className="accordion-table-wrapper">
                                        <Table
                                            dataSource={items}
                                            columns={columns}
                                            pagination={false}
                                            rowKey="variableKey"
                                            size="middle"
                                            className="minimal-nested-table"
                                        />
                                    </div>
                                </Panel>
                            ))}
                        </Collapse>
                    </div>
                )}
            </div>

            <VariableModal
                visible={modalVisible}
                variable={editingVariable}
                onClose={() => setModalVisible(false)}
                onSuccess={() => { setModalVisible(false); loadData(); }}
            />
        </div>
    );
}
