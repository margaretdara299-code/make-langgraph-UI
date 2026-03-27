/**
 * CategoriesPage — displays all categories with search, create, edit, and delete.
 */

import { useState, useEffect, useCallback } from 'react';
import { Input, Button, Typography, Empty, Spin, message, Modal } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { Category } from '@/interfaces';
import { fetchCategories, deleteCategory } from '@/services/category.service';
import CategoryCard from '@/components/CategoryCard/CategoryCard';
import CreateCategoryModal from '@/components/CreateCategoryModal/CreateCategoryModal';
import './CategoriesPage.css';

const { Title } = Typography;

export default function CategoriesPage() {
    const [searchValue, setSearchValue] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch {
            message.error('Failed to fetch categories');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const filteredCategories = searchValue.trim()
        ? categories.filter(
              (cat) =>
                  cat.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                  (cat.description ?? '').toLowerCase().includes(searchValue.toLowerCase())
          )
        : categories;

    const handleCardAction = (actionKey: string, categoryId: number) => {
        const category = categories.find(
            (c) => ((c as any).categoryId ?? c.category_id) === categoryId
        );
        if (!category) return;

        // Normalize the ID for downstream use
        const resolvedId = (category as any).categoryId ?? category.category_id;

        if (actionKey === 'edit') {
            setCategoryToEdit({ ...category, category_id: resolvedId });
            setIsModalOpen(true);
        } else if (actionKey === 'delete') {
            Modal.confirm({
                title: 'Delete Category',
                icon: <ExclamationCircleOutlined />,
                content: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
                okText: 'Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: async () => {
                    try {
                        const result = await deleteCategory(categoryId);
                        if (result.success) {
                            message.success(result.message || 'Category deleted successfully');
                            loadCategories();
                        } else {
                            message.error(result.error || 'Failed to delete category');
                        }
                    } catch (error: any) {
                        message.error(error?.message || 'Failed to delete category');
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
            <div className="categories-page__header">
                <Title level={3} className="categories-page__title">Categories</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleOpenCreate}>
                    Create Category
                </Button>
            </div>

            <div className="categories-page__toolbar">
                <Input.Search
                    placeholder="Search categories by name or description..."
                    size="large"
                    allowClear
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="categories-page__search"
                />
            </div>

            <div className="categories-page__body">
                <main className="categories-page__grid-area">
                    {isLoading ? (
                        <div className="categories-page__loading">
                            <Spin size="large" />
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="categories-page__empty">
                            <Empty description='No categories yet. Click "Create Category" to add one.' />
                        </div>
                    ) : (
                        <div className="categories-page__grid">
                            {filteredCategories.map((category) => (
                                <CategoryCard
                                    key={category.category_id || (category as any).categoryId}
                                    category={category}
                                    onAction={handleCardAction}
                                />
                            ))}
                        </div>
                    )}
                </main>
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
