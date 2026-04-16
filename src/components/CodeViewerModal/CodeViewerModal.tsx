/**
 * CodeViewerModal - Displays generated code in a VS Code-style interface.
 * Supports both single file and multiple files with file tree navigation.
 */

import { useCallback, useEffect, useMemo, useState, type Key } from "react";
import { Modal, Button, Input, Tree, Typography, message } from "antd";
import {
  CopyOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import Editor from "@monaco-editor/react";
import type { CodeViewerModalProps } from "@/interfaces";
import {
  createZipBlob,
  downloadBlob,
  getFileExtension,
  getLanguageFromFileName,
  getMimeTypeFromFileName,
  getFilePresentation
} from "@/utils/file.utils";
import "./CodeViewerModal.css";

const { Text } = Typography;


export default function CodeViewerModal({
  isOpen,
  code,
  onClose,
  fileName = "workflow.py",
}: CodeViewerModalProps) {
  const [downloadName, setDownloadName] = useState(fileName);
  const [selectedFile, setSelectedFile] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const files = useMemo(() => {
    if (typeof code === "string") {
      return { [fileName]: code };
    }
    return code || {};
  }, [code, fileName]);

  const fileNames = useMemo(() => Object.keys(files), [files]);
  const hasMultipleFiles = fileNames.length > 1;

  const activeFileName = useMemo(() => {
    if (selectedFile && files[selectedFile]) return selectedFile;
    return fileNames[0] || "";
  }, [files, fileNames, selectedFile]);

  const currentFileContent = activeFileName ? files[activeFileName] : "";

  useEffect(() => {
    if (!isOpen) return;

    if (fileNames.length === 0) {
      setSelectedFile("");
      return;
    }

    if (!selectedFile || !files[selectedFile]) {
      setSelectedFile(fileNames[0]);
    }
  }, [fileNames, files, isOpen, selectedFile]);

  useEffect(() => {
    if (!isOpen || hasMultipleFiles) return;
    setDownloadName(activeFileName || fileName);
  }, [activeFileName, fileName, hasMultipleFiles, isOpen]);

  const handleDownload = useCallback(() => {
    if (!activeFileName) return;

    const defaultExtension = getFileExtension(activeFileName);
    const finalFileName =
      downloadName && getFileExtension(downloadName)
        ? downloadName
        : `${downloadName || activeFileName}${defaultExtension}`;

    const blob = new Blob([currentFileContent], {
      type: getMimeTypeFromFileName(activeFileName),
    });

    downloadBlob(blob, finalFileName);
    message.success(`Downloaded ${finalFileName}`);
  }, [activeFileName, currentFileContent, downloadName]);

  const handleDownloadAll = useCallback(() => {
    if (fileNames.length === 0) return;

    if (!hasMultipleFiles) {
      handleDownload();
      return;
    }

    const zipBlob = createZipBlob(files);
    downloadBlob(zipBlob, "generated-code.zip");
    message.success(`Downloaded generated-code.zip (${fileNames.length} files)`);
  }, [fileNames.length, files, hasMultipleFiles, handleDownload]);

  const handleCopy = useCallback(async () => {
    if (!currentFileContent) return;

    try {
      await navigator.clipboard.writeText(currentFileContent);
      message.success("Code copied to clipboard");
    } catch {
      message.error("Failed to copy code");
    }
  }, [currentFileContent]);

  const treeData = useMemo(() => {
    return fileNames.map((name) => {
      const presentation = getFilePresentation(name);
      const isActive = activeFileName === name;

      return {
        title: (
          <span className={`code-viewer-modal__tree-title ${isActive ? "is-active" : ""}`}>
            <span className={`code-viewer-modal__tree-file-icon ${presentation.colorClass}`}>
              {presentation.icon}
            </span>
            <span className="code-viewer-modal__tree-file-name">{name}</span>
          </span>
        ),
        key: name,
        isLeaf: true,
      };
    });
  }, [activeFileName, fileNames]);

  const handleFileSelect = (selectedKeys: Key[]) => {
    const nextFile = selectedKeys[0];
    if (typeof nextFile === "string") {
      setSelectedFile(nextFile);
    }
  };

  const activePresentation = getFilePresentation(activeFileName);

  return (
    <Modal
      title={`Generated Code${hasMultipleFiles ? ` (${fileNames.length} files)` : ""}`}
      open={isOpen}
      onCancel={onClose}
      width={isMobileView ? "95vw" : 1200}
      centered
      destroyOnHidden
      className="code-viewer-modal"
      zIndex={2000}
      styles={{
        mask: {
          backdropFilter: "blur(8px)",
          background: "rgba(0, 0, 0, 0.45)",
        },
        body: { padding: 0 },
      }}
      footer={
        <div className="code-viewer-modal__footer">
          <div className="code-viewer-modal__footer-actions">
            {!hasMultipleFiles && (
              <Input
                value={downloadName}
                onChange={(e) => setDownloadName(e.target.value)}
                className="code-viewer-modal__download-input"
                placeholder={activeFileName || "workflow.py"}
              />
            )}
            <Button icon={<CopyOutlined />} onClick={handleCopy} disabled={!currentFileContent}>
              Copy
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={hasMultipleFiles ? handleDownloadAll : handleDownload}
              disabled={fileNames.length === 0}
            >
              {hasMultipleFiles ? "Download ZIP" : "Download"}
            </Button>
          </div>
        </div>
      }
    >
      <div
        className={[
          "code-viewer-modal__content",
          isMobileView ? "mobile-view" : "",
          !hasMultipleFiles ? "code-viewer-modal__content--single" : "",
        ].join(" ")}
      >
        {hasMultipleFiles && !isMobileView && (
          <div className="code-viewer-modal__file-explorer">
            <div className="code-viewer-modal__file-explorer-header">
              <Text strong>Files</Text>
            </div>
            <Tree
              blockNode
              showIcon={false}
              treeData={treeData}
              selectedKeys={activeFileName ? [activeFileName] : []}
              onSelect={handleFileSelect}
              className="code-viewer-modal__file-tree"
            />
          </div>
        )}

        {hasMultipleFiles && isMobileView && (
          <div className="code-viewer-modal__mobile-file-selector">
            <Text strong className="code-viewer-modal__mobile-file-label">
              Select File
            </Text>
            <select
              value={activeFileName}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="code-viewer-modal__mobile-select"
            >
              {fileNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="code-viewer-modal__editor-wrapper">
          <div className="code-viewer-modal__editor-header">
            <span className={`code-viewer-modal__tree-file-icon ${activePresentation.colorClass}`}>
              {activePresentation.icon}
            </span>
            <Text code>{activeFileName || "No file"}</Text>
          </div>
          <Editor
            height={isMobileView ? "400px" : "500px"}
            language={getLanguageFromFileName(activeFileName)}
            value={currentFileContent}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 'var(--text-sm)',
              fontFamily: "'Fira Code', 'Fira Mono', monospace",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 12 },
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
