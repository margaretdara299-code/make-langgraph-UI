/**
 * CapabilitiesPage — High-fidelity replica of the premium design system.
 * Manages core service connectors and platform capabilities.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks';
import { Button, message, Modal } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { fetchCapabilities, deleteCapability } from '@/services';
import type { Capability } from '@/interfaces';
import { 
    CapabilityCard, 
    CapabilityCardSkeleton, 
    CreateCapabilityModal, 
    Grid, 
    SearchInput,
    CollectionPageHeader,
    CollectionEmptyState,
} from '@/components';
import { PAGE_HEADER_CONTENT } from '@/constants/ui.constants';
import './CapabilitiesPage.css';

const { CAPABILITIES } = PAGE_HEADER_CONTENT;

export default function CapabilitiesPage() {
    const [capabilities, setCapabilities] = useState<Capability[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearch = useDebounce(searchValue, 300);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [capabilityToEdit, setCapabilityToEdit] = useState<Capability | null>(null);

    const loadCapabilities = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchCapabilities();
            setCapabilities(data);
        } catch {
            message.error('Failed to load capabilities');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCapabilities();
    }, [loadCapabilities]);

    /** Filter logic */
    const filteredCapabilities = useMemo(() => {
        const query = debouncedSearch.trim().toLowerCase();
        if (!query) return capabilities;
        
        return capabilities.filter(cap => 
            cap.name.toLowerCase().includes(query) || 
            (cap.description ?? '').toLowerCase().includes(query)
        );
    }, [capabilities, debouncedSearch]);

    /** Standard handler for card actions */
    const handleAction = async (actionKey: string, capabilityId: number, capability: Capability) => {
        if (actionKey === 'edit') {
            setCapabilityToEdit({ ...capability, capabilityId });
            setIsModalOpen(true);
        } else if (actionKey === 'delete') {
            Modal.confirm({
                title: 'Delete Capability',
                icon: <ExclamationCircleOutlined />,
                content: `Are you sure you want to remove "${capability.name}"? This action cannot be undone.`,
                okText: 'Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                centered: true,
                onOk: async () => {
                    const res = await deleteCapability(capabilityId);
                    if (res.success) {
                        message.success(res.message || 'Capability deleted successfully');
                        loadCapabilities();
                    } else {
                        message.error(res.error || 'Failed to delete capability');
                    }
                },
            });
        }
    };

    return (
        <div className="capabilities-page">
            <CollectionPageHeader
                title={CAPABILITIES.title}
                description={CAPABILITIES.description}
                action={(
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={() => { setCapabilityToEdit(null); setIsModalOpen(true); }}
                        className="global-header-add-btn"
                    />
                )}
                aside={(
                    <div className="capabilities-toolbar">
                        <SearchInput
                            placeholder="Search capabilities..."
                            value={searchValue}
                            onChange={setSearchValue}
                        />
                    </div>
                )}
            />

            <div className="capabilities-body">
                {isLoading ? (
                    <Grid 
                        data={Array(6).fill({})}
                        isLoading={true}
                        SkeletonComponent={CapabilityCardSkeleton}
                        gutter={[16, 16]}
                        autoFitMinWidth={260}
                        renderItem={(cap: Capability) => <CapabilityCard capability={cap} onAction={() => {}} />}
                    />
                ) : filteredCapabilities.length === 0 ? (
                    <CollectionEmptyState
                        className="reveal-up"
                        icon={<ThunderboltOutlined />}
                        title={searchValue ? 'No matching capabilities found' : 'Your capability list is empty'}
                        description={
                            searchValue
                                ? "Try adjusting your search to find the capability you're looking for."
                                : 'Start by adding your first capability to extend your skill potential.'
                        }
                        action={searchValue ? (
                            <Button onClick={() => setSearchValue('')}>Clear search</Button>
                        ) : (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => { setCapabilityToEdit(null); setIsModalOpen(true); }}
                            >
                                Create New Capability
                            </Button>
                        )}
                    />
                ) : (
                    <Grid 
                        data={filteredCapabilities}
                        isLoading={isLoading}
                        SkeletonComponent={CapabilityCardSkeleton}
                        gutter={[16, 16]}
                        autoFitMinWidth={260}
                        renderItem={(cap: Capability) => (
                            <CapabilityCard 
                                capability={cap} 
                                onAction={(key) => handleAction(key, cap.capabilityId, cap)} 
                            />
                        )}
                    />
                )}
            </div>

            <CreateCapabilityModal
                isOpen={isModalOpen}
                capabilityToEdit={capabilityToEdit}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => { 
                    setIsModalOpen(false); 
                    loadCapabilities(); 
                }}
            />
        </div>
    );
}
