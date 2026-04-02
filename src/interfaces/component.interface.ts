/**
 * Component Props interfaces.
 * These are thin wrappers — our components delegate to AntD internally,
 * but the app code interacts with our own typed props for consistency.
 */

import type { ReactNode } from 'react';
import type { DashboardCounts } from './engine.interface';

export interface StatusPillProps {
    status: 'draft' | 'published';
}

export interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';
}

export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export interface CardProps {
    children: ReactNode;
    onClick?: () => void;
    hoverable?: boolean;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export interface SkillCardProps {
    skill: import('./skill.interface').Skill;
    onClick?: () => void;
    onAction?: (actionKey: string, skillId: string) => void;
}

export interface StatusFilterItemProps {
    filterKey: string;
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
}

export interface CreateSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export interface EditSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
    skill: import('./skill.interface').Skill | null;
}

export interface CreateSkillFormData {
    name: string;
    skillKey: string;
    description: string;
    categoryId: number;
    tags: string[];
    creationMethod: string;
}

export interface SkillDetailsFormProps {
    form: import('antd').FormInstance<CreateSkillFormData>;
}

export interface CreationMethodCardProps {
    methodKey: string;
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

export interface CreateSkillFooterProps {
    currentStep: number;
    isSubmitting: boolean;
    onBack: () => void;
    onNext: () => void;
    onCreate: () => void;
}

export interface PropertiesDrawerProps {
    selectedNodeId: string | null;
    selectedEdgeId?: string | null;
    onClose: () => void;
}

export interface ActionCardProps {
    action: import('./action.interface').ActionDefinition;
    onAction?: (actionKey: string, actionId: string) => void;
}

export interface ActionPreviewPanelProps {
    actionDef: Partial<import('./action.interface').ActionDefinition>;
    currentStep: number;
    onTestApiClick?: () => void;
}

export interface CreateActionModalProps {
    isOpen: boolean;
    initialStep?: number;
    onClose: () => void;
    onCreated: () => void;
    actionToEdit?: import('./action.interface').ActionDefinition;
}

export interface CreateActionOverviewProps {
    draft: Partial<import('./action.interface').ActionDefinition>;
    setDraft: import('react').Dispatch<import('react').SetStateAction<Partial<import('./action.interface').ActionDefinition>>>;
    form?: import('antd').FormInstance;
}

/** Shared props for wizard steps 2–7 (same shape as Overview) */
export interface CreateActionStepProps {
    draft: Partial<import('./action.interface').ActionDefinition>;
    setDraft: import('react').Dispatch<import('react').SetStateAction<Partial<import('./action.interface').ActionDefinition>>>;
    form?: import('antd').FormInstance;
}

export interface PlaceholderStepProps {
    stepName: string;
}

export interface ReviewOverviewProps {
    draft: CreateActionStepProps['draft'];
}

export interface ReviewExecutionProps {
    execution: NonNullable<CreateActionStepProps['draft']['execution_json']>;
}

export interface ReviewConfigurationsProps {
    configurations: NonNullable<CreateActionStepProps['draft']['configurations_json']>;
}

export interface ReviewUiFormProps {
    uiForm: NonNullable<CreateActionStepProps['draft']['ui_form_json']>;
}

export interface ReviewPolicyProps {
    policy: NonNullable<CreateActionStepProps['draft']['policy_json']>;
}

export interface StructureSectionProps {
    search: string;
}



export interface CodeViewerModalProps {
    isOpen: boolean;
    code: string;
    onClose: () => void;
    fileName?: string;
}

export interface PublishStepperModalProps {
    isOpen: boolean;
    versionId: string;
    onClose: () => void;
    onViewCode?: (code: string) => void;
}

export interface TestApiModalProps {
    isOpen: boolean;
    onClose: () => void;
    testState: 'idle' | 'loading' | 'success' | 'error';
    testResponse: any;
    testInputPayload: any;
}

export interface DashboardMetricsCardProps {
    type: 'skills' | 'actions';
    data: DashboardCounts['skills'] | DashboardCounts['actions'];
}

export interface ExecutionDebuggerModalProps {
    isOpen: boolean;
    onClose: () => void;
    versionId: string;
    nodes: import('@xyflow/react').Node[];
    edges: import('@xyflow/react').Edge[];
}

export interface ExecutionInputsPaneProps {
    activeOrCompletedSteps: import('./engine.interface').ExecutedNodeStep[];
    inputContainerRef: React.RefObject<HTMLDivElement | null>;
}

export interface ExecutionStepperPaneProps {
    steps: import('./engine.interface').ExecutedNodeStep[];
    activeStepIndex: number;
    setSelectedStepIndex: (index: number) => void;
}

export interface ExecutionOutputsLogsPaneProps {
    completedStepsList: import('./engine.interface').ExecutedNodeStep[];
    outputContainerRef: React.RefObject<HTMLDivElement | null>;
    isSimulationDone: boolean;
    isExecuting: boolean;
    activeStepIndex: number;
    steps: import('./engine.interface').ExecutedNodeStep[];
    globalLogs: string[];
}
