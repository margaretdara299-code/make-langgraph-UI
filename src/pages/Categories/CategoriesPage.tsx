/**
 * CategoriesPage — displays all logical skill groupings.
 * Exact match to premium reference project.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, Typography, message, Modal, Empty, Input, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { fetchCategories, deleteCategory } from '@/services/category.service';
import type { Category } from '@/interfaces';
import CategoryCard from '@/components/CategoryCard/CategoryCard';
import CategoryCardSkeleton from '@/components/CategoryCardSkeleton/CategoryCardSkeleton';
import CreateCategoryModal from '@/components/CreateCategoryModal/CreateCategoryModal';
import './CategoriesPage.css';

const { Title, Text } = Typography;

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch {
            message.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const filteredCategories = useMemo(() => {
        const query = searchValue.trim().toLowerCase();
        if (!query) return categories;
        
        return categories.filter(cat => 
            cat.name.toLowerCase().includes(query) || 
            (cat.description ?? '').toLowerCase().includes(query)
        );
    }, [categories, searchValue]);

    const handleCardAction = (actionKey: string, categoryId: number) => {
        const category = categories.find(
            (c) => ((c as any).categoryId ?? c.category_id) === categoryId
        );
        if (!category) return;

        if (actionKey === 'edit') {
            setCategoryToEdit(category);
            setIsModalOpen(true);
        } else if (actionKey === 'delete') {
            Modal.confirm({
                title: 'Delete Category',
                icon: <ExclamationCircleOutlined />,
                content: `Remove "${category.name}"? This cannot be undone.`,
                okText: 'Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                centered: true,
                onOk: async () => {
                    const res = await deleteCategory(categoryId);
                    if (res.success) {
                        message.success(res.message);
                        loadCategories();
                    } else {
                        message.error(res.error);
                    }
                },
            });
        }
    };

    const handleOpenCreate = () => {
        setCategoryToEdit(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCategoryToEdit(null);
        setIsModalOpen(false);
    };

    return (
        <div className="categories-page">
            <header className="categories-header">
                <div className="title-section">
                    <div className="title-row">
                        <Title level={2} style={{ margin: 0, fontSize: '28px', fontWeight: 700, letterSpacing: '-0.022em' }}>Categories</Title>
                        <button 
                            className="create-category-btn-mini" 
                            onClick={handleOpenCreate}
                            title="Create New Category"
                        >
                            <PlusOutlined />
                        </button>
                    </div>
                    <Text type="secondary" style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-subtle)', display: 'block', marginTop: '4px' }}>
                        Organize and manage your logical skill groupings and orchestration clusters.
                    </Text>
                </div>
                <div className="categories-toolbar">
                    <Input
                        placeholder="Search categories..."
                        size="large"
                        allowClear
                        prefix={<SearchOutlined />}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="categories-search"
                    />
                </div>
            </header>

            <div className="categories-body">
                {isLoading ? (
                    <div className="categories-grid reveal-up">
                        {[...Array(6)].map((_, i) => (
                            <CategoryCardSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="categories-empty reveal-up">
                        <Empty 
                            description={searchValue ? 'No matches found' : 'No categories yet. Click "+" to add one.'} 
                        />
                        {searchValue && (
                            <Button type="link" onClick={() => setSearchValue('')}>
                                Clear search
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="categories-grid reveal-up">
                        {filteredCategories.map((category) => (
                            <CategoryCard
                                key={(category as any).categoryId ?? category.category_id}
                                category={category}
                                onAction={handleCardAction}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateCategoryModal
                isOpen={isModalOpen}
                categoryToEdit={categoryToEdit}
                onClose={handleCloseModal}
                onCreated={() => {
                    handleCloseModal();
                    loadCategories();
                }}
            />
        </div>
    );
}
