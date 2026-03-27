/**
 * CapabilitiesPage — displays all capabilities with search, create, edit, and delete.
 */

import { useState, useEffect, useCallback } from 'react';
import { Input, Button, Typography, Empty, Spin, message, Modal } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { Capability } from '@/interfaces';
import { fetchCapabilities, deleteCapability } from '@/services/capability.service';
import CapabilityCard from '@/components/CapabilityCard/CapabilityCard';
import CreateCapabilityModal from '@/components/CreateCapabilityModal/CreateCapabilityModal';
import './CapabilitiesPage.css';

const { Title } = Typography;

export default function CapabilitiesPage() {
    const [searchValue, setSearchValue] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [capabilities, setCapabilities] = useState<Capability[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [capabilityToEdit, setCapabilityToEdit] = useState<Capability | null>(null);

    const loadCapabilities = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchCapabilities();
            setCapabilities(data);
        } catch {
            message.error('Failed to fetch capabilities');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCapabilities();
    }, [loadCapabilities]);

    const filteredCapabilities = searchValue.trim()
        ? capabilities.filter(
              (cap) =>
                  cap.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                  (cap.description ?? '').toLowerCase().includes(searchValue.toLowerCase())
          )
        : capabilities;

    const handleCardAction = (actionKey: string, capabilityId: number) => {
        const capability = capabilities.find(
            (c) => ((c as any).capabilityId ?? c.capability_id) === capabilityId
        );
        if (!capability) return;

        // Normalize the ID for downstream use
        const resolvedId = (capability as any).capabilityId ?? capability.capability_id;

        if (actionKey === 'edit') {
            setCapabilityToEdit({ ...capability, capability_id: resolvedId });
            setIsModalOpen(true);
        } else if (actionKey === 'delete') {
            Modal.confirm({
                title: 'Delete Capability',
                icon: <ExclamationCircleOutlined />,
                content: `Are you sure you want to delete "${capability.name}"? This action cannot be undone.`,
                okText: 'Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: async () => {
                    try {
                        const result = await deleteCapability(capabilityId);
                        if (result.success) {
                            message.success(result.message || 'Capability deleted successfully');
                            loadCapabilities();
                        } else {
                            message.error(result.error || 'Failed to delete capability');
                        }
                    } catch (error: any) {
                        message.error(error?.message || 'Failed to delete capability');
                    }
                },
            });
        }
    };

    const handleOpenCreate = () => {
        setCapabilityToEdit(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCapabilityToEdit(null);
        setIsModalOpen(false);
    };

    return (
        <div className="capabilities-page">
            <div className="capabilities-page__header">
                <Title level={3} className="capabilities-page__title">Capabilities</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleOpenCreate}>
                    Create Capability
                </Button>
            </div>

            <div className="capabilities-page__toolbar">
                <Input.Search
                    placeholder="Search capabilities by name or description..."
                    size="large"
                    allowClear
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="capabilities-page__search"
                />
            </div>

            <div className="capabilities-page__body">
                <main className="capabilities-page__grid-area">
                    {isLoading ? (
                        <div className="capabilities-page__loading">
                            <Spin size="large" />
                        </div>
                    ) : filteredCapabilities.length === 0 ? (
                        <div className="capabilities-page__empty">
                            <Empty description='No capabilities yet. Click "Create Capability" to add one.' />
                        </div>
                    ) : (
                        <div className="capabilities-page__grid">
                            {filteredCapabilities.map((capability) => (
                                <CapabilityCard
                                    key={capability.capability_id || (capability as any).capabilityId}
                                    capability={capability}
                                    onAction={handleCardAction}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <CreateCapabilityModal
                isOpen={isModalOpen}
                capabilityToEdit={capabilityToEdit}
                onClose={handleCloseModal}
                onCreated={() => {
                    handleCloseModal();
                    loadCapabilities();
                }}
            />
        </div>
    );
}
