/**
 * SkillDesignerHeader — The sub-header for the visual canvas.
 * Contains skill context (name, status) and primary actions (Save, Test, Publish).
 */

import { useState, useEffect } from 'react';
import { Button, Typography, Space, Tooltip, message, Skeleton } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactFlow } from '@xyflow/react';
import StatusPill from '@/components/StatusPill/StatusPill';
import { ROUTES } from '@/routes';
import { useSkillGraph } from '@/hooks';
import { fetchSkillById } from '@/services';
import type { Skill } from '@/interfaces';
import './SkillDesignerHeader.css';

const { Text, Title } = Typography;

export default function SkillDesignerHeader() {
    const navigate = useNavigate();
    const { skillId, versionId } = useParams<{ skillId: string, versionId: string }>();
    const { getNodes, getEdges } = useReactFlow();
    const { saveGraph } = useSkillGraph();
    const [skill, setSkill] = useState<Skill | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!skillId) return;
        setIsLoading(true);
        fetchSkillById(skillId).then((res) => {
            if (res.success && res.data) {
                setSkill(res.data);
            }
            setIsLoading(false);
        });
    }, [skillId]);

    const handleSave = async () => {
        try {
            await saveGraph(getNodes(), getEdges());
            message.success('Draft saved successfully');
        } catch (error) {
            message.error('Failed to save draft');
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
                                <Text type="secondary">Version {versionId}</Text>
                                {skill && <StatusPill status={skill.status} />}
                            </Space>
                        </>
                    )}
                </div>
            </Space>

            {/* Right Side: Primary Actions */}
            <Space size="middle" className="skill-designer-header__actions">
                <Tooltip title="Save Draft">
                    <Button icon={<SaveOutlined />} onClick={handleSave}>Save</Button>
                </Tooltip>
                <Tooltip title="Test Execution Segment">
                    <Button icon={<PlayCircleOutlined />}>Test</Button>
                </Tooltip>
                <Tooltip title="Publish Version 1.0">
                    <Button type="primary" icon={<SendOutlined />}>Publish</Button>
                </Tooltip>
            </Space>
        </div>
    );
}
