/**
 * CodeViewerModal — Displays generated Python code in a VS Code-style interface.
 * Supports both single file and multiple files with file tree navigation.
 */

import { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Input, Tree, Typography } from 'antd';
import { DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { message } from 'antd';
import type { CodeViewerModalProps } from '@/interfaces';
import './CodeViewerModal.css';

const { Text } = Typography;

export default function CodeViewerModal({
    isOpen,
    code,
    onClose,
    fileName = 'workflow.py',
}: CodeViewerModalProps) {
    const [downloadName, setDownloadName] = useState(fileName);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [isMobileView, setIsMobileView] = useState(false);

    // Check screen size and adjust layout
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Parse files - handle both single string and object of files
    const files = useMemo(() => {
        if (typeof code === 'string') {
            return { [fileName]: code };
        }
        return code || {};
    }, [code, fileName]);

    // Set initial selected file
    const fileNames = Object.keys(files);
    const currentFileContent = files[selectedFile] || files[fileNames[0]] || '';

    // Auto-select first file when files change
    useEffect(() => {
        if (fileNames.length > 0 && !selectedFile) {
            setSelectedFile(fileNames[0]);
        }
    }, [fileNames, selectedFile]);

    const handleDownload = () => {
        if (fileNames.length === 1) {
            // Single file download
            const blob = new Blob([currentFileContent], { type: 'text/x-python' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadName.endsWith('.py') ? downloadName : `${downloadName}.py`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            message.success(`Downloaded ${a.download}`);
        } else {
            // Multiple files - create a zip file (simplified: download as JSON for now)
            const blob = new Blob([JSON.stringify(files, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'project-files.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            message.success('Downloaded project files');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(currentFileContent);
        message.success('Code copied to clipboard');
    };

    // Build tree data for file explorer
    const treeData = useMemo(() => {
        return fileNames.map(fileName => {
            const getFileIcon = (fileName: string) => {
                if (fileName.endsWith('.py')) return '🐍';
                if (fileName.endsWith('.js')) return '📜';
                if (fileName.endsWith('.ts')) return '📘';
                if (fileName.endsWith('.json')) return '📋';
                if (fileName.endsWith('.md')) return '📝';
                if (fileName.endsWith('.txt')) return '📄';
                if (fileName.endsWith('.html')) return '🌐';
                if (fileName.endsWith('.css')) return '🎨';
                return '📄';
            };

            const getFileColor = (fileName: string) => {
                if (fileName.endsWith('.py')) return '#3776ab';
                if (fileName.endsWith('.js')) return '#f7df1e';
                if (fileName.endsWith('.ts')) return '#3178c6';
                if (fileName.endsWith('.json')) return '#cbcb41';
                if (fileName.endsWith('.md')) return '#083fa1';
                if (fileName.endsWith('.txt')) return '#cccccc';
                return '#cccccc';
            };

            return {
                title: (
                    <span 
                        style={{ 
                            color: selectedFile === fileName ? '#ffffff' : '#cccccc',
                            fontWeight: selectedFile === fileName ? 'bold' : 'normal',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span style={{ color: getFileColor(fileName), fontSize: '14px' }}>
                            {getFileIcon(fileName)}
                        </span>
                        {fileName}
                    </span>
                ),
                key: fileName,
                icon: null, // We're using emoji icons now
                isLeaf: true,
            };
        });
    }, [fileNames, selectedFile]);

    const handleFileSelect = (selectedKeys: React.Key[]) => {
        if (selectedKeys.length > 0) {
            setSelectedFile(selectedKeys[0] as string);
        }
    };

    const getLanguageFromFileName = (fileName: string): string => {
        if (fileName.endsWith('.py')) return 'python';
        if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return 'javascript';
        if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return 'typescript';
        if (fileName.endsWith('.json')) return 'json';
        if (fileName.endsWith('.md')) return 'markdown';
        if (fileName.endsWith('.txt')) return 'plaintext';
        return 'plaintext';
    };

    return (
        <Modal
            title={`Generated Code${fileNames.length > 1 ? ` (${fileNames.length} files)` : ''}`}
            open={isOpen}
            onCancel={onClose}
            width={isMobileView ? '95vw' : 1200}
            centered
            className="code-viewer-modal"
            zIndex={2000}
            styles={{
                mask: {
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(0, 0, 0, 0.45)'
                },
                body: { padding: 0 }
            }}
            footer={
                <div className="code-viewer-modal__footer">
                    <Button icon={<CopyOutlined />} onClick={handleCopy}>
                        Copy
                    </Button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        {fileNames.length === 1 && (
                            <Input 
                                value={downloadName} 
                                onChange={(e) => setDownloadName(e.target.value)} 
                                style={{ width: '180px' }} 
                                placeholder="workflow.py"
                            />
                        )}
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleDownload}
                        >
                            Download {fileNames.length > 1 ? 'All Files' : ''}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className={`code-viewer-modal__content ${isMobileView ? 'mobile-view' : ''}`}>
                {/* File Explorer - Left Side */}
                {fileNames.length > 1 && !isMobileView && (
                    <div className="code-viewer-modal__file-explorer">
                        <div className="code-viewer-modal__file-explorer-header">
                            <Text strong>Files</Text>
                        </div>
                        <Tree
                            showIcon
                            treeData={treeData}
                            selectedKeys={selectedFile ? [selectedFile] : []}
                            onSelect={handleFileSelect}
                            className="code-viewer-modal__file-tree"
                        />
                    </div>
                )}

                {/* Mobile File Selector */}
                {fileNames.length > 1 && isMobileView && (
                    <div className="code-viewer-modal__mobile-file-selector">
                        <Text strong style={{ color: '#cccccc', marginBottom: '8px', display: 'block' }}>
                            Select File:
                        </Text>
                        <select
                            value={selectedFile || fileNames[0]}
                            onChange={(e) => setSelectedFile(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: '#2d2d30',
                                color: '#cccccc',
                                border: '1px solid #3c3c3c',
                                borderRadius: '4px',
                                fontSize: '13px',
                                marginBottom: '12px'
                            }}
                        >
                            {fileNames.map(fileName => (
                                <option key={fileName} value={fileName} style={{ background: '#2d2d30', color: '#cccccc' }}>
                                    {fileName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                {/* Code Editor - Right Side */}
                <div className="code-viewer-modal__editor-wrapper">
                    <div className="code-viewer-modal__editor-header">
                        <Text code>{selectedFile || fileNames[0] || 'No file'}</Text>
                    </div>
                    <Editor
                        height={isMobileView ? "400px" : "500px"}
                        language={getLanguageFromFileName(selectedFile || fileNames[0] || '')}
                        value={currentFileContent}
                        theme="vs-dark"
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily: "'Fira Code', 'Fira Mono', monospace",
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            padding: { top: 12 },
                        }}
                    />
                </div>
            </div>
        </Modal>
    );
}
