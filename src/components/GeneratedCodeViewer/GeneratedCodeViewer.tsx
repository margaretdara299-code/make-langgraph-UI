/**
 * GeneratedCodeViewer — VS Code-style file explorer popup
 * Displays multiple generated files in a split-pane layout:
 * - Left: File explorer (tree-like structure)
 * - Right: Code editor with syntax highlighting
 */

import { useState, useEffect } from "react";
import { Modal, Spin, Empty, Button, message } from "antd";
import {
  DownloadOutlined,
  CopyOutlined,
  FolderOutlined,
  FileOutlined,
} from "@ant-design/icons";
import Editor from "@monaco-editor/react";
import axios from "axios";
import type { GeneratedCodeViewerProps } from "@/interfaces";
import "./GeneratedCodeViewer.css";

interface FileItem {
  name: string;
  content: string;
  language: string;
}

export default function GeneratedCodeViewer({
  isOpen,
  onClose,
  skillId = "18",
  apiBaseUrl = "http://localhost:8000",
  filesData: preloadedFilesData,
}: GeneratedCodeViewerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch generated code files from API or use preloaded data
  useEffect(() => {
    if (!isOpen) return;

    const processFilesData = (fileData: Record<string, string>) => {
      if (!fileData || Object.keys(fileData).length === 0) {
        setError("No files available");
        return;
      }

      const fileList: FileItem[] = Object.entries(fileData).map(
        ([fileName, content]) => ({
          name: fileName,
          content: content as string,
          language: getLanguageFromExtension(fileName),
        }),
      );

      setFiles(fileList);
      if (fileList.length > 0) {
        setSelectedFile(fileList[0]);
      }
    };

    const fetchGeneratedCode = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use preloaded data if available, otherwise fetch from API
        if (preloadedFilesData && Object.keys(preloadedFilesData).length > 0) {
          processFilesData(preloadedFilesData);
        } else {
          const response = await axios.get(
            `${apiBaseUrl}/api/v1/engine/generate-code/${skillId}`,
          );

          if (response.data.status && response.data.data) {
            processFilesData(response.data.data);
          } else {
            setError("Failed to load generated files");
          }
        }
      } catch (err) {
        const errorMsg = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : "Unknown error occurred";
        setError(`Error loading files: ${errorMsg}`);
        console.error("Failed to fetch generated code:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneratedCode();
  }, [isOpen, skillId, apiBaseUrl, preloadedFilesData]);

  // Determine language based on file extension
  const getLanguageFromExtension = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      py: "python",
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      md: "markdown",
      txt: "plaintext",
      yaml: "yaml",
      yml: "yaml",
      html: "html",
      css: "css",
    };
    return languageMap[ext || ""] || "plaintext";
  };

  const handleDownload = () => {
    if (!selectedFile) return;

    const blob = new Blob([selectedFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`Downloaded ${selectedFile.name}`);
  };

  const handleCopyAll = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    message.success(`Copied ${selectedFile.name} to clipboard`);
  };

  const handleDownloadAll = () => {
    files.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    message.success(`Downloaded ${files.length} files`);
  };

  return (
    <Modal
      title="Generated Code Explorer"
      open={isOpen}
      onCancel={onClose}
      width="90vw"
      height="90vh"
      style={{ maxHeight: "90vh" }}
      className="generated-code-viewer"
      footer={
        <div className="generated-code-viewer__footer">
          <Button onClick={handleDownloadAll} disabled={files.length === 0}>
            Download All
          </Button>
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopyAll}
              disabled={!selectedFile}
            >
              Copy
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={!selectedFile}
            >
              Download
            </Button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="generated-code-viewer__loading">
          <Spin size="large" tip="Loading generated files..." />
        </div>
      ) : error ? (
        <Empty description={error} />
      ) : (
        <div className="generated-code-viewer__container">
          {/* Left Panel: File Explorer */}
          <div className="generated-code-viewer__sidebar">
            <div className="generated-code-viewer__sidebar-header">
              <FolderOutlined />
              <span>Generated Files ({files.length})</span>
            </div>
            <div className="generated-code-viewer__file-list">
              {files.length === 0 ? (
                <Empty description="No files generated" />
              ) : (
                <div className="generated-code-viewer__file-tree">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className={`generated-code-viewer__file-item ${
                        selectedFile?.name === file.name ? "active" : ""
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <FileOutlined className="generated-code-viewer__file-icon" />
                      <span className="generated-code-viewer__file-name">
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Code Editor */}
          <div className="generated-code-viewer__editor-pane">
            {selectedFile ? (
              <>
                <div className="generated-code-viewer__editor-header">
                  <span className="generated-code-viewer__file-path">
                    {selectedFile.name}
                  </span>
                </div>
                <Editor
                  height="calc(100% - 40px)"
                  language={selectedFile.language}
                  value={selectedFile.content}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: true },
                    fontSize: 12,
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    padding: { top: 12 },
                    automaticLayout: true,
                  }}
                />
              </>
            ) : (
              <Empty description="Select a file to view" />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
