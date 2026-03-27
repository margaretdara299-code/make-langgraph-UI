/**
 * Represents a Capability fetched from the backend.
 */
export interface Capability {
    capability_id: number;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

/** Props for components that display or manage capabilities */
export interface CapabilityCardProps {
    capability: Capability;
    onAction?: (actionKey: string, capabilityId: number) => void;
}

export interface CreateCapabilityModalProps {
    isOpen: boolean;
    capabilityToEdit?: Capability | null;
    onClose: () => void;
    onCreated: () => void;
}
