/**
 * Mock Graph Data
 * Represents a pre-built "Eligibility Verification" template to populate the canvas initially.
 */

import { type Node, type Edge } from '@xyflow/react';

export const MOCK_INITIAL_NODES: Node[] = [
    {
        id: 'node-start-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
            label: 'Schedule Trigger',
            category: 'Triggers',
            capability: 'api',
            actionKey: 'trigger.schedule'
        },
    },
    {
        id: 'node-action-1',
        type: 'connector',
        position: { x: 250, y: 200 },
        data: {
            label: 'Verify Eligibility',
            category: 'Eligibility',
            capability: 'api',
            actionKey: 'eligibility.verify'
        },
    },
    {
        id: 'node-end-1',
        type: 'end',
        position: { x: 250, y: 350 },
        data: {
            label: 'Success Flow',
            category: 'Ends',
            capability: 'rules',
            actionKey: 'end.success'
        },
    }
];

export const MOCK_INITIAL_EDGES: Edge[] = [
    {
        id: 'edge-1',
        source: 'node-start-1',
        target: 'node-action-1',
        animated: true,
        data: { routeType: 'unconditional' }
    },
    {
        id: 'edge-2',
        source: 'node-action-1',
        target: 'node-end-1',
        animated: true,
        data: { routeType: 'unconditional' }
    }
];
