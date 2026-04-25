import { useEffect, useState, useMemo, useCallback } from 'react';
import { 
    Typography, 
    Button, 
    Table, 
    Space, 
    message, 
    Empty, 
    Spin, 
    Collapse
} from 'antd';
import { 
    PlusOutlined, 
    Key 
} from '@ant-design/icons';
import { fetchVariables, deleteVariable } from '@/services/variables.service';
import type { Variable } from '@/services/variables.service';
import VariableModal from './VariableModal';
import { getVariableColumns, mapVariablesToGroups } from '../Groups/GroupsPage.helpers';
import { PAGE_HEADER_CONTENT } from '@/constants/ui.constants';
import { SearchInput } from '@/components';
import { Layers } from 'lucide-react';
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
        // We reuse the grouping logic here for a clean UI
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
        }
    };

    const columns = useMemo(() => getVariableColumns(handleEdit, handleDelete), [loadData]);

    return (
        <div className="variables-page reveal-up">
            <header className="variables-header">
                <div className="title-section">
                    <div className="title-row">
                        <Title level={2} className="var-page-title">{VARIABLES.title}</Title>
                    </div>
                    <Text type="secondary" className="var-page-subtitle">{VARIABLES.description}</Text>
                </div>
                <div className="var-header-actions">
                    <SearchInput placeholder="Search variables..." value={search} onChange={setSearch} />
                    <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={handleCreate} className="global-header-add-btn" />
                </div>
            </header>

            <div className="variables-body">
                {loading ? <div className="var-loading-state"><Spin size="large" /></div> :
                    variables.length === 0 ? <Empty description="No variables found" className="var-empty-state" /> : (
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
                                                        {items.length}
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
