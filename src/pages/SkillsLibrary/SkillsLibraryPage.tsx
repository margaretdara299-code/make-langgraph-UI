/**
 * Skills Library page — displays all skills with filters, search, and card grid.
 * Handles card actions (Edit, Test, Publish, Archive, Delete).
 */

import { useState } from 'react';
import { Input, Spin, Empty, Button, Typography, Modal, message, Tabs, Badge, Space } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSkills, useCategories } from '@/hooks';
import { SkillCard, CreateSkillModal, EditSkillModal } from '@/components';
import { STATUS_FILTER_OPTIONS, CARD_ACTION_KEYS } from '@/constants';
import { deleteSkill, updateSkillVersionStatus, SkillVersionStatusValue } from '@/services';
import { ROUTES } from '@/routes';
import type { UseSkillsFilters } from '@/interfaces';
import './SkillsLibraryPage.css';

const { Title } = Typography;

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
                    onOk: async () => {
                        const result = await deleteSkill(skillId);
                        if (result.success) {
                            message.success('Skill deleted successfully');
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
                        message.success(actionKey === CARD_ACTION_KEYS.PUBLISH ? 'Published successfully' : 'Unpublished successfully');
                        refetch();
                    } else {
                        message.error(result.error || 'Failed to update version status');
                    }
                } else {
                    message.warning('Cannot update status: No valid version ID found.');
                }
                break;
            }


            case CARD_ACTION_KEYS.BUILD_SKILL:
                navigate(ROUTES.SKILL_DESIGNER.replace(':skillId', skillId).replace(':versionId', 'v1'));
                break;

            case CARD_ACTION_KEYS.EDIT_SETTINGS:
                const skillToEdit = skills.find((skill) => skill.id === skillId);
                if (skillToEdit) {
                    setEditingSkill(skillToEdit);
                    setIsEditModalOpen(true);
                }
                break;

            case CARD_ACTION_KEYS.TEST:
                message.info('Coming in Phase 3...');
                break;
        }
    };


    return (
        <div className="skills-library">
            {/* ── Page Header ── */}
            <div className="skills-library__header">
                <Title level={3} className="skills-library__title">Skills Library</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Create Skill
                </Button>
            </div>

            {/* ── Search Bar & Horizontal Filters ── */}
            <div className="skills-library__toolbar">
                <Input.Search
                    placeholder="Search skills by name, key, or description..."
                    size="large"
                    allowClear
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="skills-library__search"
                />

                <Tabs
                    activeKey={activeStatus}
                    onChange={handleStatusFilter}
                    className="skills-library__tabs"
                    items={STATUS_FILTER_OPTIONS.map((option) => ({
                        key: option.key,
                        label: (
                            <Space>
                                <option.icon />
                                <span>{option.label}</span>
                                <Badge
                                    count={statusCounts[option.key] ?? 0}
                                    showZero
                                    color={activeStatus === option.key ? 'var(--color-primary)' : '#d9d9d9'}
                                    style={{ fontSize: '10px' }}
                                />
                            </Space>
                        ),
                    }))}
                />
            </div>

            {/* ── Main Content Area ── */}
            <div className="skills-library__body">
                {/* ── Card Grid ── */}
                <main className="skills-library__grid-area">
                    {isLoading ? (
                        <div className="skills-library__loading">
                            <Spin size="large" />
                        </div>
                    ) : skills.length === 0 ? (
                        <div className="skills-library__empty">
                            <Empty description="No skills match your filters" />
                        </div>
                    ) : (
                        <div className="skills-library__grid">
                            {skills.map((skill) => {
                                const categoryName = categories.find((category) => category.categoryId === skill.categoryId)?.name || 'Unknown';
                                return (
                                    <SkillCard
                                        key={skill.id}
                                        skill={{ ...skill, category: categoryName }}
                                        onAction={handleCardAction}
                                    />
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* ── Create Skill Modal ── */}
            <CreateSkillModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={refetch}
            />

            {/* ── Edit Skill Modal ── */}
            <EditSkillModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdated={refetch}
                skill={editingSkill}
            />
        </div>
    );
}
