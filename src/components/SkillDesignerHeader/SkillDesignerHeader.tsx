import React, { useState, useEffect } from 'react';
import { Space, Tooltip, message, Dropdown, Input, Divider, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronDown, Play, Save, Zap, Search, Code, Check
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

import { useSkillGraph } from '@/hooks';
import { fetchSkillById, fetchSkills } from '@/services/skill.service';
import { generateCode } from '@/services/graph.service';
import { getStatusConfig } from '@/utils/status.util';
import { ROUTES } from '@/routes';
import type { Skill } from '@/interfaces';

import CodeViewerModal from '@/components/CodeViewerModal/CodeViewerModal';
import PublishStepperModal from '@/components/PublishStepperModal/PublishStepperModal';
import ExecutionPromptModal from '@/components/ExecutionPromptModal/ExecutionPromptModal';

import './SkillDesignerHeader.css';

export default function SkillDesignerHeader() {
    const navigate = useNavigate();
    const { getNodes, getEdges } = useReactFlow();
    const { skillId } = useParams<{ skillId: string }>();
    const { saveGraph, versionId } = useSkillGraph();
    
    const [skill, setSkill] = useState<Skill | null>(null);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);

    useEffect(() => {
        if (!skillId) return;
        setIsLoading(true);
        Promise.all([
          fetchSkillById(skillId),
          fetchSkills({ pageSize: 100 })
        ]).then(([res, listRes]) => {
            if (res.success && res.data) setSkill(res.data);
            if (listRes.data) setAllSkills(listRes.data);
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
            setGeneratedCode(result || {});
            setIsCodeViewerOpen(true);
        } catch (err: any) {
            message.error(err?.message || 'Failed to generate code');
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const statusConfig = getStatusConfig(skill?.status || 'draft');
    const StatusIcon = statusConfig.icon;

    const filteredSkills = allSkills.filter(s => 
      s.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const skillItems = filteredSkills.map((s) => ({
      key: s.id,
      label: (
        <div className="skill-dropdown-item" onClick={() => navigate(`/skills/${s.id}/versions/${s.latestVersionId || ''}/design`)}>
          <div className="skill-info">
            <span className="skill-dropdown-name">{s.name}</span>
          </div>
          {s.id === skillId && <Check size={14} className="active-check-icon" />}
        </div>
      ),
    }));

    return (
        <header className="builder-header">
            {/* Left: Section for spacing if needed */}
            <div className="builder-header-left">
            </div>

            {/* Center: Breadcrumb */}
            <div className="builder-header-center">
                <nav className="breadcrumb">
                  <button className="breadcrumb-item link" onClick={() => navigate(ROUTES.SKILLS_LIBRARY)}>
                    Skills
                  </button>

                  <span className="breadcrumb-separator">/</span>

                  <div className="breadcrumb-container">
                    <Dropdown
                      menu={{ items: skillItems }}
                      trigger={['click']}
                      placement="bottomLeft"
                      overlayClassName="builder-dropdown"
                      dropdownRender={(menu) => (
                        <div className="dropdown-content-wrapper">
                          <div className="dropdown-search-wrapper">
                            <Input
                              placeholder="Search skills..."
                              prefix={<Search size={12} className="search-icon" />}
                              value={searchValue}
                              onChange={(e) => setSearchValue(e.target.value)}
                              variant="borderless"
                              className="compact-search"
                            />
                          </div>
                          <Divider style={{ margin: '4px 0' }} />
                          <div className="dropdown-scroll-area">
                            {React.cloneElement(menu as React.ReactElement)}
                          </div>
                        </div>
                      )}
                    >
                      <span className="breadcrumb-item skill-name clickable">
                        {isLoading ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ opacity: 0.5 }}>Syncing...</span>
                            <Spin size="small" />
                          </div>
                        ) : (
                          <>
                            {skill?.name}
                            <ChevronDown size={14} className="dropdown-arrow ml-1" />
                          </>
                        )}
                      </span>
                    </Dropdown>

                    <span className="breadcrumb-separator" style={{ margin: '0 8px' }}>/</span>

                    <div className={`status-indicator ${statusConfig.className}`}>
                      <StatusIcon size={11} strokeWidth={2.5} className="status-icon" />
                      <span className="status-badge">{statusConfig.label}</span>
                    </div>
                  </div>
                </nav>
            </div>

            {/* Right Side: Actions */}
            <div className="builder-header-right">
                <motion.button
                  className="hdr-btn hdr-btn-outline"
                  whileTap={{ scale: 0.96 }}
                  onClick={handleViewCode}
                  disabled={isGeneratingCode || !versionId}
                >
                  {isGeneratingCode ? <Spin size="small" /> : <Code size={14} />}
                  View Code
                </motion.button>

                <motion.button
                  className="hdr-btn hdr-btn-outline"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => versionId && setIsDebuggerOpen(true)}
                  disabled={!versionId}
                >
                  <Play size={14} />
                  Run
                </motion.button>

                <motion.button
                  className="hdr-btn hdr-btn-outline"
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSave}
                >
                  <Save size={14} />
                  Save
                </motion.button>

                <motion.button
                  className="hdr-btn hdr-btn-primary"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsPublishOpen(true)}
                  disabled={!versionId}
                >
                  <Zap size={14} />
                  Publish
                </motion.button>
            </div>

            {/* Modals */}
            <CodeViewerModal isOpen={isCodeViewerOpen} code={generatedCode} onClose={() => setIsCodeViewerOpen(false)} />
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
            {versionId && (
                <ExecutionPromptModal 
                    isOpen={isDebuggerOpen}
                    onClose={() => setIsDebuggerOpen(false)}
                    versionId={versionId}
                    nodes={getNodes()}
                    edges={getEdges()}
                />
            )}
        </header>
    );
}
