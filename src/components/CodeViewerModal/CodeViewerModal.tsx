/**
 * CodeViewerModal — Displays generated Python code in a Monaco editor.
 * Includes a download button to save the code as a .py file.
 */

import { useState } from 'react';
import { Modal, Button, Input } from 'antd';
import { DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { message } from 'antd';
import type { CodeViewerModalProps } from '@/interfaces';
import './CodeViewerModal.css';

export default function CodeViewerModal({
    isOpen,
    code,
    onClose,
    fileName = 'workflow.py',
}: CodeViewerModalProps) {
    const [downloadName, setDownloadName] = useState(fileName);

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName.endsWith('.py') ? downloadName : `${downloadName}.py`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success(`Downloaded ${a.download}`);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        message.success('Code copied to clipboard');
    };

    return (
        <Modal
            title="Generated LangGraph Code"
            open={isOpen}
            onCancel={onClose}
            width={800}
            className="code-viewer-modal"
            footer={
                <div className="code-viewer-modal__footer">
                    <Button icon={<CopyOutlined />} onClick={handleCopy}>
                        Copy
                    </Button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        <Input 
                            value={downloadName} 
                            onChange={(e) => setDownloadName(e.target.value)} 
                            style={{ width: '180px' }} 
                            placeholder="workflow.py"
                        />
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleDownload}
                        >
                            Download
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="code-viewer-modal__editor-wrapper">
                <Editor
                    height="500px"
                    language="python"
                    value={code}
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
        </Modal>
    );
}
