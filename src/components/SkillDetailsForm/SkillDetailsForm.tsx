/**
 * SkillDetailsForm — Step 1 form for the Create Skill wizard.
 */

import { Form, Input, Select } from 'antd';
import { SKILL_CATEGORIES } from '@/constants';
import type { SkillDetailsFormProps } from '@/interfaces';

const { TextArea } = Input;

export default function SkillDetailsForm({ form }: SkillDetailsFormProps) {
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
                <Input placeholder="e.g. Denial Triage & Resolution" />
            </Form.Item>

            <Form.Item
                name="skillKey"
                label="Skill Key"
                rules={[{ required: true, message: 'Please enter a unique skill key' }]}
            >
                <Input placeholder="e.g. DENTRI (uppercase, 6 chars)" />
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter a description' }]}
            >
                <TextArea
                    placeholder="Briefly describe what this skill does..."
                    rows={3}
                />
            </Form.Item>

            <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select a category' }]}
            >
                <Select
                    placeholder="Select a category"
                    options={[...SKILL_CATEGORIES]}
                />
            </Form.Item>

            <Form.Item name="tags" label="Tags">
                <Select
                    mode="tags"
                    placeholder="Add tags (press Enter after each)"
                />
            </Form.Item>
        </Form>
    );
}
