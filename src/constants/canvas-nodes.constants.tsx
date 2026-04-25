/**
 * Canvas node type registry.
 * Separated from component code to follow proper constants organization.
 */

import ActionNode from '@/components/ActionNode/ActionNode';
import TriggerNode from '@/components/TriggerNode/TriggerNode';
import ConnectorNode from '@/components/ConnectorNode/ConnectorNode';
import EndNode from '@/components/EndNode/EndNode';
import SubFlowNode from '@/components/SubFlowNode/SubFlowNode';
import StartNode from '@/components/StartNode/StartNode';
import DecisionNode from '@/components/DecisionNode/DecisionNode';
import ErrorNode from '@/components/ErrorNode/ErrorNode';
import QueueNode from '@/components/QueueNode/QueueNode';
import DeletableEdge from '@/components/DeletableEdge/DeletableEdge';
import ParallelSplitNode from '@/components/ParallelSplitNode/ParallelSplitNode';
import ParallelJoinNode from '@/components/ParallelJoinNode/ParallelJoinNode';

export const NODE_TYPES = {
    action:   ActionNode,
    trigger:  TriggerNode,
    connector: ConnectorNode,
    end:      EndNode,
    subflow:  SubFlowNode,
    start:    StartNode,
    decision: DecisionNode,
    error:    ErrorNode,
    queue:    QueueNode,
    parallel_split: ParallelSplitNode,
    parallel_join:  ParallelJoinNode,
};

export const EDGE_TYPES = {
    default:    DeletableEdge,
    smoothstep: DeletableEdge,   // uses our custom renderer with smooth-step path
};
