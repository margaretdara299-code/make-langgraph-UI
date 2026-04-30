/**
 * SkillDetailsForm — Step 1 form for the Create Skill wizard.
 */

import { Form, Input, Select } from 'antd';
import { useCategories } from '@/hooks';
import { LucideIconPicker } from '@/components';
import type { SkillDetailsFormProps } from '@/interfaces';
import './SkillDetailsForm.css';

const { TextArea } = Input;

export default function SkillDetailsForm({ form }: SkillDetailsFormProps) {
    const { categories, isLoading } = useCategories();
    return (
        <Form
            form={form}
            layout="vertical"
            className="create-skill__form"
            requiredMark={true}
        >
            <div className="sdf-row">
                <div className="sdf-flex-2">
                    <Form.Item
                        name="name"
                        label="Skill Name"
                        rules={[{ required: true, message: 'Required' }]}
                    >
                        <Input size="large" placeholder="e.g. Denial Triage & Resolution" />
                    </Form.Item>
                </div>
                <div className="sdf-flex-1">
                    <Form.Item
                        name="skillKey"
                        label="Skill Key"
                        rules={[{ required: true, message: 'Required' }]}
                    >
                        <Input size="large" placeholder="e.g. DENTRI" />
                    </Form.Item>
                </div>
            </div>

            <div className="sdf-row">
                <div className="sdf-flex-1">
                    <Form.Item
                        name="categoryId"
                        label="Category"
                        rules={[{ required: true, message: 'Required' }]}
                    >
                        <Select
                            size="large"
                            placeholder="Select a category"
                            loading={isLoading}
                            disabled={isLoading}
                            showSearch
                            optionFilterProp="label"
                            options={categories.map((category) => ({ value: category.categoryId, label: category.name }))}
                        />
                    </Form.Item>
                </div>
                <div className="sdf-flex-1">
                    <Form.Item name="tags" label="Tags">
                        <Select
                            size="large"
                            mode="tags"
                            placeholder="Add tags..."
                            className="sdf-tags-select"
                        />
                    </Form.Item>
                </div>
            </div>

            <div className="sdf-row">
                <div className="sdf-flex-1">
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea
                            size="large"
                            placeholder="Briefly describe what this skill does..."
                            rows={3}
                            className="sdf-textarea"
                        />
                    </Form.Item>
                </div>
            </div>
        </Form>
    );
}
