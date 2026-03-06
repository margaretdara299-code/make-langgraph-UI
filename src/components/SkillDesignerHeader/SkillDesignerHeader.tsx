/**
 * SkillDesignerHeader — The sub-header for the visual canvas.
 * Contains skill context (name, status) and primary actions (Save, Test, Publish).
 */

import { Button, Typography, Space, Tooltip } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StatusPill from '@/components/StatusPill/StatusPill';
import { ROUTES } from '@/routes';
import './SkillDesignerHeader.css';

const { Text, Title } = Typography;

export default function SkillDesignerHeader() {
    const navigate = useNavigate();

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
                    <Title level={4} style={{ margin: 0 }}>Eligibility Verification</Title>
                    <Space size="small" className="skill-designer-header__meta">
                        <Text type="secondary" code>eligibility.verify</Text>
                        <Text type="secondary">Version v1</Text>
                        <StatusPill status="draft" />
                    </Space>
                </div>
            </Space>

            {/* Right Side: Primary Actions */}
            <Space size="middle" className="skill-designer-header__actions">
                <Tooltip title="Save Draft">
                    <Button icon={<SaveOutlined />}>Save</Button>
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
