# GeneratedCodeViewer Integration Guide

This guide explains how to integrate the `GeneratedCodeViewer` component into your application to display generated code files.

## Quick Start Integration

### 1. Import the Component

```typescript
import { GeneratedCodeViewer } from '@/components';
```

### 2. Add State Management

```typescript
import { useState } from 'react';

const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);
const [skillId, setSkillId] = useState('18');
```

### 3. Add the Component to Your JSX

```typescript
<GeneratedCodeViewer
    isOpen={isCodeViewerOpen}
    onClose={() => setIsCodeViewerOpen(false)}
    skillId={skillId}
    apiBaseUrl="http://localhost:8000"
/>
```

### 4. Trigger from a Button or Action

```typescript
<Button
    onClick={() => {
        setSkillId('18');
        setIsCodeViewerOpen(true);
    }}
    icon={<CodeOutlined />}
>
    View Generated Code
</Button>
```

## Common Integration Scenarios

### Scenario 1: In a Skill List Page

Display a "View Code" button next to each skill:

```typescript
import { GeneratedCodeViewer, Button } from '@/components';
import { useState } from 'react';
import { CodeOutlined } from '@ant-design/icons';

export default function SkillListPage() {
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [selectedSkillId, setSelectedSkillId] = useState('');

    const handleViewCode = (skillId: string) => {
        setSelectedSkillId(skillId);
        setIsViewerOpen(true);
    };

    return (
        <>
            <div className="skills-list">
                {skills.map(skill => (
                    <div key={skill.id} className="skill-item">
                        <h3>{skill.name}</h3>
                        <Button
                            icon={<CodeOutlined />}
                            onClick={() => handleViewCode(skill.id)}
                        >
                            View Code
                        </Button>
                    </div>
                ))}
            </div>

            <GeneratedCodeViewer
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                skillId={selectedSkillId}
                apiBaseUrl="http://localhost:8000"
            />
        </>
    );
}
```

### Scenario 2: In a Skill Details/Dashboard Page

Show code viewer when clicking on a code view button in the skill details:

```typescript
import { GeneratedCodeViewer } from '@/components';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function SkillDetailsPage() {
    const { skillId } = useParams<{ skillId: string }>();
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [skillData, setSkillData] = useState(null);

    useEffect(() => {
        // Fetch skill details
        fetchSkillDetails(skillId);
    }, [skillId]);

    return (
        <div className="skill-details">
            <h1>{skillData?.name}</h1>
            <p>{skillData?.description}</p>

            <Button
                type="primary"
                size="large"
                onClick={() => setIsViewerOpen(true)}
            >
                View Generated Code
            </Button>

            <GeneratedCodeViewer
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                skillId={skillId}
            />
        </div>
    );
}
```

### Scenario 3: In Publish/Review Modal

Integrate with the existing publish flow:

```typescript
import { GeneratedCodeViewer } from '@/components';
import { useState } from 'react';

export default function PublishReviewModal({ versionId }) {
    const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);

    return (
        <>
            <Modal
                title="Review Before Publishing"
                open={true}
            >
                <p>Skill ID: {versionId}</p>
                <Button
                    onClick={() => setIsCodeViewerOpen(true)}
                >
                    View Full Generated Code
                </Button>
            </Modal>

            <GeneratedCodeViewer
                isOpen={isCodeViewerOpen}
                onClose={() => setIsCodeViewerOpen(false)}
                skillId={versionId}
            />
        </>
    );
}
```

### Scenario 4: In a Development/Preview Layout

Show code viewer alongside other panels:

```typescript
import { GeneratedCodeViewer } from '@/components';
import { useState } from 'react';

export default function SkillDeveloperWorkspace() {
    const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);
    const [selectedSkillId, setSelectedSkillId] = useState('18');

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Left Panel: Canvas */}
            <div style={{ flex: 1 }}>
                <SkillDesignerCanvas />
            </div>

            {/* Right Panel: Actions */}
            <div style={{ width: '300px', padding: '20px' }}>
                <h3>Actions</h3>
                <Button
                    block
                    onClick={() => setIsCodeViewerOpen(true)}
                >
                    View Generated Code
                </Button>
            </div>

            {/* Code Viewer Modal */}
            <GeneratedCodeViewer
                isOpen={isCodeViewerOpen}
                onClose={() => setIsCodeViewerOpen(false)}
                skillId={selectedSkillId}
            />
        </div>
    );
}
```

## Advanced Usage

### Dynamic API Base URL

Handle different environments:

```typescript
const apiBaseUrl = 
    process.env.NODE_ENV === 'production' 
        ? 'https://api.production.com'
        : 'http://localhost:8000';

<GeneratedCodeViewer
    isOpen={isOpen}
    onClose={onClose}
    skillId={skillId}
    apiBaseUrl={apiBaseUrl}
/>
```

### With Error Tracking

Implement logging and error tracking:

```typescript
const [lastError, setLastError] = useState('');
const [viewCount, setViewCount] = useState(0);

const handleOpenViewer = (id: string) => {
    setSelectedSkillId(id);
    setIsViewerOpen(true);
    setViewCount(prev => prev + 1);
    // Log to analytics
    logEvent('view_generated_code', { skillId: id });
};
```

### Custom Styling

Override styles in your component's CSS module:

```css
/* MyPage.module.css */
:global(.generated-code-viewer) {
    /* Your custom styles */
}

:global(.generated-code-viewer__sidebar) {
    /* Custom sidebar styling */
}

:global(.generated-code-viewer__file-item.active) {
    background-color: #e6f7ff;
    border-left-color: #1890ff;
}
```

## Integration with Other Components

### With SkillCard

Add code viewer trigger to skill cards:

```typescript
interface SkillCardProps {
    skill: Skill;
    onViewCode?: (skillId: string) => void;
}

<SkillCard
    skill={skill}
    onViewCode={(skillId) => {
        setSelectedSkillId(skillId);
        setIsViewerOpen(true);
    }}
/>
```

### With ActionCard

Show generated code for action nodes:

```typescript
<ActionCard
    action={action}
    onViewCode={(actionId) => {
        setSelectedId(actionId);
        setIsViewerOpen(true);
    }}
/>
```

## Testing Integration

### Manual Testing

1. Open your application
2. Navigate to the page with the integrated viewer
3. Click the "View Code" button
4. Verify files load correctly
5. Test file selection
6. Test copy and download functions

### Unit Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MySkillPage from './MySkillPage';

describe('GeneratedCodeViewer Integration', () => {
    test('opens code viewer when button is clicked', () => {
        render(<MySkillPage skillId="18" />);
        
        const viewCodeButton = screen.getByText('View Code');
        fireEvent.click(viewCodeButton);
        
        // Verify modal is open
        expect(screen.getByText('Generated Code Explorer')).toBeInTheDocument();
    });

    test('closes code viewer when close is clicked', async () => {
        render(<MySkillPage skillId="18" />);
        
        const viewCodeButton = screen.getByText('View Code');
        fireEvent.click(viewCodeButton);
        
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);
        
        // Verify modal is closed
        await expect(() => 
            screen.getByText('Generated Code Explorer')
        ).toThrow();
    });
});
```

## Performance Optimization

### Lazy Load Component

```typescript
import { lazy, Suspense } from 'react';

const GeneratedCodeViewer = lazy(() =>
    import('@/components').then(m => ({ 
        default: m.GeneratedCodeViewer 
    }))
);

// Usage
<Suspense fallback={null}>
    <GeneratedCodeViewer {...props} />
</Suspense>
```

### Memoize Parent Component

```typescript
import { memo } from 'react';

const MySkillPage = memo(function SkillPage({ skillId }) {
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    return (
        <>
            {/* ... */}
            <GeneratedCodeViewer
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                skillId={skillId}
            />
        </>
    );
});
```

## Troubleshooting Common Issues

### Issue: Component not rendering

**Solution**: Ensure the component is properly exported from the barrel export:

```typescript
// Check src/components/index.ts
export { default as GeneratedCodeViewer } from './GeneratedCodeViewer/GeneratedCodeViewer';
```

### Issue: API request failing

**Solution**: Verify the endpoint is correct:

```
GET http://localhost:8000/api/v1/engine/generate-code/{skillId}
```

### Issue: Styling looks wrong

**Solution**: Import CSS properly and check for conflicting styles:

```typescript
// Make sure CSS is imported
import './GeneratedCodeViewer.css';
```

### Issue: Monaco editor not showing

**Solution**: Check that the modal has proper height and `@monaco-editor/react` is installed:

```bash
npm list @monaco-editor/react
```

## Best Practices

1. **Always provide skillId**: Pass a valid skill ID or the API will fail
2. **Handle errors gracefully**: The component handles errors internally but log them
3. **Use correct API URL**: Verify the API base URL matches your backend
4. **Responsive design**: Test on mobile and tablet devices
5. **Accessibility**: Test keyboard navigation and screen reader compatibility
6. **Performance**: Consider lazy loading for large code bases

## Next Steps

1. Integrate the component into your main pages
2. Test with various skill IDs
3. Customize styling to match your design system
4. Add logging and error tracking
5. Test across different browsers and devices

For more information, see the full documentation in `GeneratedCodeViewer/README.md`.
