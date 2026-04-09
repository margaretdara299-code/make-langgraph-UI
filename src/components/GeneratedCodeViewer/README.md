# GeneratedCodeViewer Component

A VS Code-style code explorer and viewer component that displays generated project files in a split-pane layout.

## Overview

The `GeneratedCodeViewer` component provides a modern, intuitive interface for viewing multiple generated code files from the Tensaw Skill Studio API. It features:

- **Left Panel**: File explorer/tree showing all generated files
- **Right Panel**: Monaco code editor with syntax highlighting
- **File Operations**: Copy, download individual files, or batch download all files
- **Smart Language Detection**: Automatically detects programming language based on file extension
- **VS Code Dark Theme**: Professional, dark-themed UI matching VS Code aesthetics
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-fetching**: Automatically fetches files from the API when opened

## Installation

The component is pre-configured and ready to use. It's exported from the main components barrel:

```typescript
import { GeneratedCodeViewer } from '@/components';
```

### Dependencies

The component relies on the following packages (already in package.json):

- `@monaco-editor/react` — Code editor with syntax highlighting
- `antd` — UI components (Modal, Button, Spin, Empty, message)
- `axios` — HTTP client for API requests
- `antd/icons` — UI icons

## Usage

### Basic Example

```typescript
import { GeneratedCodeViewer } from '@/components';
import { useState } from 'react';

export default function MyComponent() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)}>
                View Generated Code
            </button>

            <GeneratedCodeViewer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                skillId="18"
                apiBaseUrl="http://localhost:8000"
            />
        </>
    );
}
```

### With Custom API URL

```typescript
<GeneratedCodeViewer
    isOpen={viewerOpen}
    onClose={() => setViewerOpen(false)}
    skillId="42"
    apiBaseUrl="https://api.production.com"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | — | Controls modal visibility |
| `onClose` | `() => void` | Yes | — | Callback function when closing the modal |
| `skillId` | `string \| number` | No | `"18"` | The Skill ID to fetch generated code for |
| `apiBaseUrl` | `string` | No | `"http://localhost:8000"` | Base URL for the API endpoint |

## API Endpoint

The component fetches from:

```
GET {apiBaseUrl}/api/v1/engine/generate-code/{skillId}
```

### Expected Response Format

```json
{
    "status": true,
    "message": "Project files generated successfully",
    "data": {
        "utils.py": "def log_step(...): ...",
        "helpers.py": "def execute_api_action(...): ...",
        "langgraph_workflow.py": "from langgraph.graph import ...",
        "main.py": "def run(): ...",
        "requirements.txt": "langgraph>=0.2.0\nhttpx>=0.27.0",
        "README.md": "# Skill Version 18\n..."
    }
}
```

## Features

### 1. File Explorer Panel (Left)
- Displays all generated files
- Active file highlighted with blue left border
- Hover effects for better UX
- File count indicator
- Folder icon for context

### 2. Code Editor Panel (Right)
- **Syntax Highlighting**: Supports Python, TypeScript, JavaScript, JSON, Markdown, YAML, HTML, CSS, and plaintext
- **Read-only Mode**: Code cannot be edited in the viewer
- **Minimap**: Overview of the entire file (can be toggled)
- **Line Numbers**: Always visible
- **Word Wrap**: Enabled for readability
- **Monaco Editor**: Professional code editor experience

### 3. File Operations
- **Copy Code**: Copy the selected file's content to clipboard
- **Download File**: Download the selected file individually
- **Download All**: Batch download all files as separate files
- Visual feedback with toast messages

### 4. Responsive Design
- **Desktop**: Split-pane layout with sidebar
- **Tablet**: Optimized for narrower screens
- **Mobile**: Stacked layout with horizontal file selector

## Styling

The component uses a VS Code-inspired dark theme:

- **Background**: `#1e1e1e` (Dark gray)
- **Sidebar**: `#252526` (Slightly lighter)
- **Active File**: `#37373d` with blue border (`#007acc`)
- **Text**: `#cccccc` (Light gray)
- **Borders**: `#3e3e42` (Dark borders)

Custom CSS is located in `GeneratedCodeViewer.css`.

## Language Support

The component automatically detects the programming language based on file extension:

```typescript
{
    py: 'python',
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    txt: 'plaintext',
    yaml: 'yaml',
    yml: 'yaml',
    html: 'html',
    css: 'css',
}
```

## Error Handling

The component handles various error scenarios:

- **Network Errors**: Displays error message from the API
- **No Files**: Shows "No files generated" message
- **Invalid Response**: Shows friendly error message
- **Loading State**: Spinner while fetching files

Example error handling:

```json
{
    "status": false,
    "message": "Skill not found"
}
```

## Performance Considerations

1. **Lazy Loading**: Files are fetched only when modal is opened
2. **Monaco Editor**: Uses `automaticLayout: true` to handle resize events
3. **Read-only Mode**: Optimized performance by preventing edit operations
4. **Minimap**: Optional; can be disabled for large files

## Keyboard Shortcuts (Monaco Editor)

Since the editor is read-only, only view-related shortcuts work:

- **Ctrl+F**: Open find dialog
- **Ctrl+G**: Go to line
- **Ctrl+Home/End**: Jump to file start/end
- **Mouse Wheel**: Scroll
- **Ctrl+Scroll**: Zoom in/out

## Accessibility

- **Semantic HTML**: Proper heading and button structure
- **ARIA Attributes**: Buttons have descriptive labels
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: Dark theme meets WCAG standards
- **Focus Indicators**: Clear focus states for keyboard users

## Troubleshooting

### Files Not Loading

1. Verify the API endpoint is correct
2. Check that the skill ID exists
3. Ensure CORS is enabled on the API server
4. Check browser console for error messages

### Monaco Editor Not Rendering

1. Clear browser cache
2. Verify `@monaco-editor/react` is installed
3. Check that the modal body has proper height

### Styling Issues

1. Verify CSS file is imported
2. Check browser DevTools for CSS conflicts
3. Ensure Ant Design theme provider is configured

## Related Components

- **CodeViewerModal** (`CodeViewerModal.tsx`): Simpler single-file code viewer
- **Modal** (`Modal.tsx`): Base modal component from Ant Design

## Future Enhancements

Potential features for future versions:

- [ ] Search/filter files by name
- [ ] File preview with folder structure
- [ ] Syntax theme switcher (light/dark)
- [ ] Code diff viewer for comparing files
- [ ] File upload and modification
- [ ] Terminal/output panel integration
- [ ] Git integration for version control

## Code Quality

- **TypeScript**: Fully typed component
- **Props Interface**: `GeneratedCodeViewerProps` defined in `component.interface.ts`
- **Error Boundaries**: Graceful error handling
- **Comments**: Well-documented code sections

## File Structure

```
src/
├── components/
│   ├── GeneratedCodeViewer/
│   │   ├── GeneratedCodeViewer.tsx      # Main component
│   │   └── GeneratedCodeViewer.css      # Styling
│   └── index.ts                          # Export
├── interfaces/
│   └── component.interface.ts            # Props interface
└── pages/
    └── GeneratedCodeViewerDemo.tsx       # Demo page
```

## Testing

To test the component:

1. Navigate to the demo page: `/generated-code-viewer-demo`
2. Click "Open Code Viewer"
3. Verify files load from API
4. Test file selection and switching
5. Test copy and download functions
6. Test responsive behavior on different screen sizes

## Support

For issues or feature requests, contact the development team or check the project documentation.
