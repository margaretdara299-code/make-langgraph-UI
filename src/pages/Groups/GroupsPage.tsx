import { useEffect, useState, useCallback, useMemo } from 'react';
import { Typography, Button, Modal, message, Empty, Space, Skeleton } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

// Services & Types
import { fetchGroups, deleteGroup } from '@/services/groups.service';
import { fetchVariables, deleteVariable } from '@/services/variables.service';
import type { Group } from '@/services/groups.service';
import type { Variable } from '@/services/variables.service';

// Hooks & Utils
import { useDebounce } from '@/hooks';
import { mapVariablesToGroups, promptDeleteGroup, promptDeleteVariable } from './GroupsPage.helpers';

// Components
import { SearchInput } from '@/components';
import { PAGE_HEADER_CONTENT } from '@/constants/ui.constants';
import { NewGroupCard } from './components/NewGroupCard';
import { InlineGroupEditor } from './components/InlineGroupEditor';
import { GroupCard } from './components/GroupCard';
import { GroupsSkeleton } from './components/GroupsSkeleton';

// Styles
import './GroupsPage.css';

const { Title, Text } = Typography;
const { GROUPS } = PAGE_HEADER_CONTENT;

/**
 * Variable Groups Management Page.
 * Orchestrates group/variable data fetching and provides the high-fidelity grid interface.
 */
export default function GroupsPage() {
    // --- State ---
    const [groups, setGroups] = useState<Group[]>([]);
    const [variables, setVariables] = useState<Variable[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearch = useDebounce(searchValue, 300);
    const [loading, setLoading] = useState(true);

    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

    // --- Data Fetching ---
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [gData, vData] = await Promise.all([
                fetchGroups(),
                fetchVariables()
            ]);
            setGroups(gData);
            setVariables(vData);
        } catch (err) {
            message.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // --- Memorized Computations ---
    const filteredGroups = useMemo(() => {
        const query = debouncedSearch.trim().toLowerCase();
        if (!query) return groups;
        return groups.filter(g =>
            (g.groupKey || '').toLowerCase().includes(query) ||
            (g.groupName || '').toLowerCase().includes(query)
        );
    }, [groups, debouncedSearch]);

    const groupToVariables = useMemo(() =>
        mapVariablesToGroups(groups, variables),
        [groups, variables]);

    // Handlers removed - using helpers directly in JSX




    return (
        <div className="groups-page">
            <header className="groups-header">
                <div className="title-section">
                    <div className="title-row">
                        <Title level={2} className="page-main-title">{GROUPS.title}</Title>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<PlusOutlined />}
                            onClick={() => setIsAddingGroup(true)}
                            className="global-header-add-btn"
                        />
                    </div>
                    <Text type="secondary" className="page-description">{GROUPS.description}</Text>
                </div>
                <div className="groups-toolbar">
                    <SearchInput placeholder="Search config..." value={searchValue} onChange={setSearchValue} />
                </div>
            </header>

            <div className="groups-body">
                {loading ? <GroupsSkeleton /> : filteredGroups.length === 0 && !isAddingGroup ? (
                    <div className="groups-empty reveal-up">
                        <Empty
                            description={searchValue ? "No groups match your search" : "No groups configured yet"}
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button type="primary" onClick={() => setIsAddingGroup(true)}>Create First Group</Button>
                        </Empty>
                    </div>
                ) : (
                    <div className="groups-cards-container reveal-up">
                        {isAddingGroup && (
                            <NewGroupCard
                                onAdded={() => { setIsAddingGroup(false); loadData(); }}
                                onCancel={() => setIsAddingGroup(false)}
                            />
                        )}
                        {filteredGroups.map(group => (
                            editingGroupId === group.groupId ? (
                                <InlineGroupEditor
                                    key={group.groupId}
                                    group={group}
                                    onUpdated={() => { setEditingGroupId(null); loadData(); }}
                                    onCancel={() => setEditingGroupId(null)}
                                />
                            ) : (
                                <GroupCard 
                                    key={group.groupId}
                                    group={group}
                                    variables={groupToVariables[group.groupName] || []}
                                    onEditGroup={(g) => setEditingGroupId(g.groupId)}
                                    onDeleteGroup={(g) => promptDeleteGroup(g, loadData)}
                                    onDeleteVariable={(v) => promptDeleteVariable(v, loadData)}
                                    refreshData={loadData}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
