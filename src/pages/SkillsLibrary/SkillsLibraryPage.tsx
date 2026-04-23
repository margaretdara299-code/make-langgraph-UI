

import { useState } from 'react';
import { Input, Typography, Modal, message, Tabs, Badge, Space, Empty, Button } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSkills, useCategories } from '@/hooks';
import { SkillCard, CreateSkillModal, EditSkillModal, SearchInput } from '@/components';
import { PAGE_HEADER_CONTENT } from '@/constants/ui.constants';
import SkillCardSkeleton from '@/components/Skeletons/SkillCardSkeleton';
import { STATUS_FILTER_OPTIONS, CARD_ACTION_KEYS } from '@/constants';
import {
    deleteSkill,
    updateSkillVersionStatus,
    SkillVersionStatusValue,
} from '@/services';
import type { UseSkillsFilters } from '@/interfaces';
import './SkillsLibraryPage.css';

const { Title, Text } = Typography;
const { SKILLS_LIBRARY } = PAGE_HEADER_CONTENT;

export default function SkillsLibraryPage() {
    const [activeStatus, setActiveStatus] = useState<string>('all');
    const [searchValue, setSearchValue] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<any>(null);
    const navigate = useNavigate();

    const { skills, isLoading, statusCounts, setFilters, refetch } = useSkills();
    const { categories } = useCategories();

    /** Handle status filter click */
    const handleStatusFilter = (statusKey: string) => {
        setActiveStatus(statusKey);
        const newFilters: UseSkillsFilters = {
            search: searchValue || undefined,
        };
        if (statusKey !== 'all') {
            newFilters.status = statusKey;
        }
        setFilters(newFilters);
    };

    /** Handle search */
    const handleSearch = (value: string) => {
        setSearchValue(value);
        const newFilters: UseSkillsFilters = {
            search: value || undefined,
        };
        if (activeStatus !== 'all') {
            newFilters.status = activeStatus;
        }
        setFilters(newFilters);
    };

    /** Handle card action menu clicks */
    const handleCardAction = async (actionKey: string, skillId: string) => {
        switch (actionKey) {
            case CARD_ACTION_KEYS.DELETE:
                Modal.confirm({
                    title: 'Delete Skill',
                    icon: <ExclamationCircleOutlined />,
                    content: 'Are you sure you want to delete this skill? This action cannot be undone.',
                    okText: 'Delete',
                    okType: 'danger',
                    centered: true,
                    onOk: async () => {
                        const result = await deleteSkill(skillId);
                        if (result.success) {
                            message.success(result.message || 'Skill deleted successfully');
                            refetch();
                        } else {
                            message.error(result.error || 'Failed to delete skill');
                        }
                    },
                });
                break;

            case CARD_ACTION_KEYS.PUBLISH:
            case CARD_ACTION_KEYS.UNPUBLISH: {
                const skillToPublish = skills.find((skill) => skill.id === skillId);
                if (skillToPublish?.latestVersionId) {
                    const targetStatus = actionKey === CARD_ACTION_KEYS.PUBLISH
                        ? SkillVersionStatusValue.PUBLISHED
                        : SkillVersionStatusValue.UNPUBLISHED;
                    const result = await updateSkillVersionStatus(skillToPublish.latestVersionId, targetStatus);
                    if (result.success) {
                        message.success(result.message || (actionKey === CARD_ACTION_KEYS.PUBLISH ? 'Published successfully' : 'Unpublished successfully'));
                        refetch();
                    } else {
                        message.error(result.error || 'Failed to update version status');
                    }
                }
                break;
            }

            case CARD_ACTION_KEYS.BUILD_SKILL: {
                const pubSkill = skills.find((s) => s.id === skillId);
                if (pubSkill?.latestVersionId) {
                    navigate(`/skills/${skillId}/versions/${pubSkill.latestVersionId}/design`);
                }
                break;
            }

            case CARD_ACTION_KEYS.EDIT_SETTINGS:
                const skillToEdit = skills.find((skill) => skill.id === skillId);
                if (skillToEdit) {
                    setEditingSkill(skillToEdit);
                    setIsEditModalOpen(true);
                }
                break;

            case CARD_ACTION_KEYS.TEST:
                message.info('Coming soon...');
                break;
        }
    };

    return (
        <div className="skills-library-page">
            <header className="skills-library-header">
                <div className="title-section">
                    <div className="title-row">
                        <Title level={2}>{SKILLS_LIBRARY.title}</Title>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<PlusOutlined />}
                            className="global-header-add-btn"
                            onClick={() => setIsCreateModalOpen(true)}
                            title="Create New Skill"
                        />
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', display: 'block', marginTop: '4px' }}>
                        {SKILLS_LIBRARY.description}
                    </Text>
                </div>
            </header>

            <div className="skills-library-toolbar">
                <Tabs
                    activeKey={activeStatus}
                    onChange={handleStatusFilter}
                    className="skills-library-tabs"
                    items={STATUS_FILTER_OPTIONS.map((option) => ({
                        key: option.key,
                        label: option.label,
                    }))}
                />

                <div className="skills-library-search-container">
                    <SearchInput
                        placeholder="Search skills..."
                        value={searchValue}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <div className="skills-library-body">
                {isLoading ? (
                    <div className="skills-library-grid">
                        <span style={{ display: 'none' }}>GRID_LOADING_ACTIVE</span>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <SkillCardSkeleton key={i} />
                        ))}
                    </div>
                ) : skills.length === 0 ? (
                    <div className="skills-empty">
                        <Empty description="No skills found" />
                    </div>
                ) : (
                    <div className="skills-library-grid">
                        {skills.map((skill) => {
                            const categoryName = categories.find((cat) => cat?.categoryId === skill.categoryId)?.name || 'General';
                            return (
                                <SkillCard
                                    key={skill.id}
                                    skill={{ ...skill, category: categoryName }}
                                    onAction={handleCardAction}
                                    onClick={() => handleCardAction(CARD_ACTION_KEYS.EDIT_SETTINGS, skill.id)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <CreateSkillModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={() => {
                    setFilters({});
                    refetch();
                }}
            />

            <EditSkillModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdated={refetch}
                skill={editingSkill}
            />
        </div>
    );
}
