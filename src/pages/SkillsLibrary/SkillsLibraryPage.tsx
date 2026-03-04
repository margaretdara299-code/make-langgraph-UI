/**
 * Skills Library page — displays all skills with filters, search, and card grid.
 */

import { useState } from 'react';
import { Input, Spin, Empty, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSkills } from '@/hooks';
import { SkillCard, StatusFilterItem, CreateSkillModal } from '@/components';
import { STATUS_FILTER_OPTIONS } from '@/constants';
import type { UseSkillsFilters } from '@/interfaces';
import './SkillsLibraryPage.css';

const { Title } = Typography;

export default function SkillsLibraryPage() {
    const [activeStatus, setActiveStatus] = useState<string>('all');
    const [searchValue, setSearchValue] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
                                <SkillCard key={skill.id} skill={skill} />
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
