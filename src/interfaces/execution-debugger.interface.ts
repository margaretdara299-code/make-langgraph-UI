import type { ReactNode, RefObject } from 'react';
import type { Edge, Node } from '@xyflow/react';
import type { ExecutedNodeStep } from './engine.interface';

export type ExecutionDebuggerPaneType = 'input' | 'output';

export type ExecutionDebuggerBadgeIcon = 'loading' | 'success' | 'error';

export interface ExecutionDebuggerStatusBadge {
    label: string;
    className: string;
    icon: ExecutionDebuggerBadgeIcon;
}

export interface ExecutionDebuggerModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: Node[];
    edges: Edge[];
}

export interface ExecutionDebuggerStepCardProps {
    step: ExecutedNodeStep;
    type: ExecutionDebuggerPaneType;
    isLoading?: boolean;
}

export interface ExecutionDebuggerStepCardSkeletonProps {
    type: ExecutionDebuggerPaneType;
}

export interface DebuggerCanvasInnerProps {
    nodes: Node[];
    edges: Edge[];
}

export interface ExecutionInputsPaneProps {
    activeOrCompletedSteps: ExecutedNodeStep[];
    inputContainerRef: RefObject<HTMLDivElement | null>;
}

export interface ExecutionStepperPaneProps {
    steps: ExecutedNodeStep[];
    activeStepIndex: number;
    setSelectedStepIndex: (index: number) => void;
}

export interface ExecutionOutputsLogsPaneProps {
    completedStepsList: ExecutedNodeStep[];
    outputContainerRef: RefObject<HTMLDivElement | null>;
    isSimulationDone: boolean;
    isExecuting: boolean;
    activeStepIndex: number;
    steps: ExecutedNodeStep[];
    globalLogs: string[];
}

export interface ExecutionDebuggerBadgeIconMap {
    loading: ReactNode;
    success: ReactNode;
    error: ReactNode;
}
