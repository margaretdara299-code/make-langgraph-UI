/**
 * Skills Library page — displays all skills with filters, search, and card grid.
 * Handles card actions (Edit, Test, Publish, Archive, Delete).
 */

import { useState } from 'react';
import { Input, Spin, Empty, Button, Typography, Modal, message } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSkills } from '@/hooks';
import { SkillCard, StatusFilterItem, CreateSkillModal } from '@/components';
import { STATUS_FILTER_OPTIONS, CARD_ACTION_KEYS } from '@/constants';
import { deleteSkill, updateSkillStatus } from '@/services';
import { ROUTES } from '@/routes';
import type { UseSkillsFilters } from '@/interfaces';
import './SkillsLibraryPage.css';

const { Title } = Typography;

export default function SkillsLibraryPage() {
    const [activeStatus, setActiveStatus] = useState<string>('all');
    const [searchValue, setSearchValue] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();

    const { skills, isLoading, statusCounts, setFilters, refetch } = useSkills();

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
    const handleCardAction = (actionKey: string, skillId: string) => {
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
                handleStatusChange(skillId, 'published', 'Skill published successfully');
                break;

            case CARD_ACTION_KEYS.UNPUBLISH:
                handleStatusChange(skillId, 'draft', 'Skill moved back to Draft');
                break;

            case CARD_ACTION_KEYS.ARCHIVE:
                handleStatusChange(skillId, 'archived', 'Skill archived successfully');
                break;

            case CARD_ACTION_KEYS.EDIT:
                navigate(ROUTES.SKILL_DESIGNER.replace(':skillId', skillId).replace(':versionId', 'v1'));
                break;

            case CARD_ACTION_KEYS.TEST:
                message.info('Coming in Phase 3...');
                break;
        }
    };

    /** Helper to update skill status */
    const handleStatusChange = async (skillId: string, status: 'draft' | 'published' | 'archived', successMsg: string) => {
        const result = await updateSkillStatus(skillId, status);
        if (result.success) {
            message.success(successMsg);
            refetch();
        } else {
            message.error(result.error || 'Failed to update skill');
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

            {/* ── Search Bar ── */}
            <Input.Search
                placeholder="Search skills by name, key, or description..."
                size="large"
                allowClear
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="skills-library__search"
            />

            {/* ── Main Content Area ── */}
            <div className="skills-library__body">
                {/* ── Sidebar Filters ── */}
                <aside className="skills-library__sidebar">
                    <div className="skills-library__filter-title">Status</div>
                    {STATUS_FILTER_OPTIONS.map((option) => (
                        <StatusFilterItem
                            key={option.key}
                            filterKey={option.key}
                            label={option.label}
                            count={statusCounts[option.key] ?? 0}
                            isActive={activeStatus === option.key}
                            onClick={() => handleStatusFilter(option.key)}
                        />
                    ))}
                </aside>

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
                            {skills.map((skill) => (
                                <SkillCard
                                    key={skill.id}
                                    skill={skill}
                                    onAction={handleCardAction}
                                />
                            ))}
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
        </div>
    );
}
