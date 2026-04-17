import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Typography, Input, Button, message } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useExecution } from '@/contexts';
import type { Node, Edge } from '@xyflow/react';

const { Title, Text } = Typography;

interface ExecutionPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    versionId: string;
    nodes: Node[];
    edges: Edge[];
}

export default function ExecutionPromptModal({ isOpen, onClose, versionId, nodes, edges }: ExecutionPromptModalProps) {
    const { runExecution } = useExecution();

    // Derive initial JSON from the Start node's initial_state variables
    const derivedInitialJson = useMemo(() => {
        const startNode = nodes?.find((node: any) => node.type === 'start');
        const initialState: Array<{ key: string; value: string }> = startNode?.data?.initial_state || [];
        if (initialState.length === 0) return '{}';
        const obj: Record<string, string> = {};
        for (const item of initialState) {
            if (item.key) obj[item.key] = item.value ?? '';
        }
        return JSON.stringify(obj, null, 2);
    }, [nodes]);

    const [initialDataStr, setInitialDataStr] = useState<string>(derivedInitialJson);

    useEffect(() => {
        if (isOpen) {
            setInitialDataStr(derivedInitialJson);
        }
    }, [isOpen, derivedInitialJson]);

    const handleStart = () => {
        let parsed = {};
        try {
            parsed = JSON.parse(initialDataStr);
        } catch (e) {
            message.error("Invalid JSON input");
            return;
        }

        // Let the provider handle execution
        runExecution(versionId, nodes, edges, parsed);
        onClose(); // Close the modal to reveal the animated canvas
    };

    return (
        <Modal
            title={
                <div>
                    <Title level={4} style={{ margin: 0 }}>Start Execution Validation</Title>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            className="execution-prompt-modal"
            zIndex={2000}
        >
            <div style={{ padding: '1rem 0' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: '1rem' }}>
                    Pass initial contextual data into the workflow run. This simulates an external event (like a webhook or API call) providing state to the Workflow Entry node.
                </Text>
                <Input.TextArea
                    value={initialDataStr}
                    onChange={(e) => setInitialDataStr(e.target.value)}

                    style={{
                        fontFamily: 'monospace',
                        marginBottom: '1.5rem',
                        fontSize: 'var(--text-sm)',
                        padding: '12px',
                        borderRadius: '8px',
                    }}
                />
                <Button
                    type="primary"
                    size="large"
                    onClick={handleStart}
                    icon={<PlayCircleOutlined />}
                    style={{ width: '100%' }}
                >
                    Run Skill
                </Button>
            </div>
        </Modal>
    );
}
