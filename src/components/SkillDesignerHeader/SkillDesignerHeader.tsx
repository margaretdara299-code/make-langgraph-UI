/**
 * SkillDesignerHeader — The sub-header for the visual canvas.
 * Contains skill context (name, status) and primary actions (Save, View Code, Publish).
 */

import { useState, useEffect } from 'react';
import { Button, Typography, Space, Tooltip, message, Skeleton } from 'antd';
import { ArrowLeftOutlined, CodeOutlined, SaveOutlined, SendOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import StatusPill from '@/components/StatusPill/StatusPill';
import CodeViewerModal from '@/components/CodeViewerModal/CodeViewerModal';
import PublishStepperModal from '@/components/PublishStepperModal/PublishStepperModal';
import ExecutionDebuggerModal from '@/components/ExecutionDebuggerModal/ExecutionDebuggerModal';
import { ROUTES } from '@/routes';
import { useSkillGraph } from '@/hooks';
import { fetchSkillById } from '@/services';
import { generateCode } from '@/services/graph.service';
import { useReactFlow } from '@xyflow/react';
import type { Skill } from '@/interfaces';
import './SkillDesignerHeader.css';

const { Text, Title } = Typography;

export default function SkillDesignerHeader() {
    const navigate = useNavigate();
    const { getNodes, getEdges } = useReactFlow();
    const { skillId } = useParams<{ skillId: string }>();
    const { saveGraph, versionId } = useSkillGraph();
    const [skill, setSkill] = useState<Skill | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // View Code state
    const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);

    // Publish stepper state
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    
    // Debugger Modal
    const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);

    useEffect(() => {
        if (!skillId) return;
        setIsLoading(true);
        fetchSkillById(skillId).then((res) => {
            if (res.success && res.data) {
                setSkill(res.data);
            } else if (!res.success) {
                message.error(res.error || 'Failed to load skill details');
            }
            setIsLoading(false);
        });
    }, [skillId]);

    const handleSave = async () => {
        try {
            const res: any = await saveGraph();
            message.success(res.message || 'Draft saved successfully');
        } catch (error: any) {
            message.error(error?.message || 'Failed to save draft');
        }
    };

    const handleViewCode = async () => {
        if (!versionId) return;
        setIsGeneratingCode(true);
        try {
            const result: any = await generateCode(versionId);
            // The result is directly the files object, not wrapped in data
            const code = result || {};
            console.log('[View Code] API Result:', result);
            
            if (!code || typeof code !== 'object' || Object.keys(code).length === 0) {
                throw new Error('No code available');
            }
            
            setGeneratedCode(code);
            setIsCodeViewerOpen(true);
        } catch (err: any) {
            message.error(err?.message || 'Failed to generate code');
        } finally {
            setIsGeneratingCode(false);
        }
    };

    return (
        <div className="skill-designer-header">
            {/* Left Side: Context & Navigation */}
            <Space size="large" className="skill-designer-header__context">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(ROUTES.SKILLS_LIBRARY)}
                    className="skill-designer-header__back-btn"
                />

                <div className="skill-designer-header__titles">
                    {isLoading ? (
                        <Skeleton.Input active size="small" style={{ width: 200 }} />
                    ) : (
                        <>
                            <Title level={4} style={{ margin: 0 }}>{skill?.name || 'Unknown Skill'}</Title>
                            <Space size="small" className="skill-designer-header__meta">
                                <Text type="secondary" code>{skill?.skillKey || 'unknown'}</Text>
                                {skill && <StatusPill status={skill.status} />}
                            </Space>
                        </>
                    )}
                </div>
            </Space>

            {/* Right Side: Primary Actions */}
            <Space size="small" className="skill-designer-header__actions">
                <Tooltip title="Run Workflow">
                    <Button
                        size="small"
                        type="default"
                        className="skill-designer-header__run-btn--active"
                        icon={<PlayCircleOutlined />}
                        onClick={() => versionId && setIsDebuggerOpen(true)}
                        disabled={!versionId}
                    >
                        Run
                    </Button>
                </Tooltip>
                
                <Tooltip title="Save Draft">
                    <Button size="small" icon={<SaveOutlined />} onClick={handleSave}>Save</Button>
                </Tooltip>
                <Tooltip title="View Generated Code">
                    <Button
                        size="small"
                        icon={<CodeOutlined />}
                        onClick={handleViewCode}
                        loading={isGeneratingCode}
                        disabled={!versionId}
                    >
                        View Code
                    </Button>
                </Tooltip>
                <Tooltip title="Publish Workflow">
                    <Button
                        size="small"
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => setIsPublishOpen(true)}
                        disabled={!versionId}
                    >
                        Publish
                    </Button>
                </Tooltip>
            </Space>


            {/* Code Viewer Modal */}
            <CodeViewerModal
                isOpen={isCodeViewerOpen}
                code={generatedCode}
                onClose={() => setIsCodeViewerOpen(false)}
            />

            {/* Publish Stepper Modal */}
            <PublishStepperModal
                isOpen={isPublishOpen}
                versionId={versionId}
                onClose={() => setIsPublishOpen(false)}
                onViewCode={(code) => {
                    setIsPublishOpen(false);
                    setGeneratedCode(code);
                    setIsCodeViewerOpen(true);
                }}
            />

            {/* Execution Debugger Modal */}
            {versionId && (
                <ExecutionDebuggerModal 
                    isOpen={isDebuggerOpen}
                    onClose={() => setIsDebuggerOpen(false)}
                    versionId={versionId}
                    nodes={getNodes()}
                    edges={getEdges()}
                />
            )}
        </div>
    );
}

