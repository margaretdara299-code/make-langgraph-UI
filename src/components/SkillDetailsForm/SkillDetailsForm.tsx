/**
 * SkillDetailsForm — Step 1 form for the Create Skill wizard.
 */

import { Form, Input, Select } from 'antd';
import { useCategories } from '@/hooks';
import type { SkillDetailsFormProps } from '@/interfaces';

const { TextArea } = Input;

export default function SkillDetailsForm({ form }: SkillDetailsFormProps) {
    const { categories, isLoading } = useCategories();
    return (
        <Form
            form={form}
            layout="vertical"
            className="create-skill__form"
        >
            <Form.Item
                name="name"
                label="Skill Name"
                rules={[{ required: true, message: 'Please enter a skill name' }]}
            >
                <Input size="large" placeholder="e.g. Denial Triage & Resolution" />
            </Form.Item>

            <Form.Item
                name="skillKey"
                label="Skill Key"
                rules={[{ required: true, message: 'Please enter a unique skill key' }]}
            >
                <Input size="large" placeholder="e.g. DENTRI (uppercase, 6 chars)" />
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter a description' }]}
            >
                <TextArea
                    size="large"
                    placeholder="Briefly describe what this skill does..."
                    rows={4}
                    style={{ minHeight: '100px' }}
                />
            </Form.Item>

            <Form.Item
                name="categoryId"
                label="Category"
                rules={[{ required: true, message: 'Please select a category' }]}
            >
                <Select
                    size="large"
                    placeholder="Select a category"
                    loading={isLoading}
                    disabled={isLoading}
                    options={categories.map((category) => ({ value: category.categoryId, label: category.name }))}
                />
            </Form.Item>

            <Form.Item name="tags" label="Tags">
                <Select
                    size="large"
                    mode="tags"
                    placeholder="Add tags (press Enter after each)"
                />
            </Form.Item>
        </Form>
    );
}
