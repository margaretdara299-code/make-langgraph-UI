import './ExecutionPromptModal.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Typography, Input, Button, message } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useExecution } from '@/contexts';
import type { Node, Edge } from '@xyflow/react';

const { Title, Text } = Typography;

interface ExecutionPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExecutionStarted: () => void;
    versionId: string;
    nodes: Node[];
    edges: Edge[];
}

export default function ExecutionPromptModal({ isOpen, onClose, onExecutionStarted, versionId, nodes, edges }: ExecutionPromptModalProps) {
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

        // Start execution, then signal parent to open debugger modal
        runExecution(versionId, nodes, edges, parsed);
        onClose();
        onExecutionStarted();
    };

    return (
        <Modal
            title={
                <div>
                    <Title level={4} className="epm-modal-title">Start Execution Validation</Title>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            zIndex={2000}
            width={600}
            centered
            className="execution-prompt-modal"
        >
            <div className="epm-body">
                <Text type="secondary" className="epm-description">
                    Pass initial contextual data into the workflow run. This simulates an external event (like a webhook or API call) providing state to the Workflow Entry node.
                </Text>
                <Input.TextArea
                    value={initialDataStr}
                    onChange={(e) => setInitialDataStr(e.target.value)}

                    className="epm-code-input"
                />
                <Button
                    type="primary"
                    size="large"
                    onClick={handleStart}
                    icon={<PlayCircleOutlined />}
                    className="epm-run-btn"
                >
                    Run Skill
                </Button>
            </div>
        </Modal>
    );
}

