/**
 * ViewerToolbar — Compact icon-only action bar for the code viewer.
 *
 * Sits in the top-right of the editor header row.
 * Actions: split toggle, theme toggle, copy, download.
 */

import { useCallback } from "react";
import { Tooltip, message } from "antd";
import {
  CopyOutlined,
  DownloadOutlined,
  SunOutlined,
  MoonOutlined,
  SplitCellsOutlined,
} from "@ant-design/icons";
import {
  createZipBlob,
  downloadBlob,
  getMimeTypeFromFileName,
} from "@/utils/file.utils";

interface ViewerToolbarProps {
  theme: "vs-dark" | "light";
  isSplitView: boolean;
  hasMultipleFiles: boolean;
  activeFile: string;
  activeContent: string;
  files: Record<string, string>;
  onThemeToggle: () => void;
  onSplitToggle: () => void;
}

export default function ViewerToolbar({
  theme,
  isSplitView,
  hasMultipleFiles,
  activeFile,
  activeContent,
  files,
  onThemeToggle,
  onSplitToggle,
}: ViewerToolbarProps) {
  /**
   * Copy active file content to clipboard.
   */
  const handleCopy = useCallback(async () => {
    if (!activeContent) return;
    try {
      await navigator.clipboard.writeText(activeContent);
      message.success("Copied to clipboard");
    } catch {
      message.error("Failed to copy");
    }
  }, [activeContent]);

  /**
   * Download the active single file as a blob.
   */
  const handleDownloadFile = useCallback(() => {
    if (!activeFile || !activeContent) return;
    const blob = new Blob([activeContent], {
      type: getMimeTypeFromFileName(activeFile),
    });
    downloadBlob(blob, activeFile);
    message.success(`Downloaded ${activeFile}`);
  }, [activeFile, activeContent]);

  /**
   * Download all files as a ZIP archive.
   */
  const handleDownloadZip = useCallback(() => {
    const fileNames = Object.keys(files);
    if (fileNames.length === 0) return;
    const zipBlob = createZipBlob(files);
    downloadBlob(zipBlob, "generated-code.zip");
    message.success(`Downloaded generated-code.zip (${fileNames.length} files)`);
  }, [files]);

  const handleDownload = hasMultipleFiles ? handleDownloadZip : handleDownloadFile;
  const downloadTooltip = hasMultipleFiles ? "Download ZIP" : "Download file";

  return (
    <div className="cv-toolbar">
      {/* Split toggle — only meaningful with multiple files */}
      {hasMultipleFiles && (
        <Tooltip title={isSplitView ? "Close split" : "Split editor"} placement="bottom">
          <button
            id="cv-toolbar-split"
            className={`cv-toolbar__btn${isSplitView ? " cv-toolbar__btn--active" : ""}`}
            onClick={onSplitToggle}
            aria-label={isSplitView ? "Close split view" : "Open split view"}
            aria-pressed={isSplitView}
          >
            <SplitCellsOutlined />
          </button>
        </Tooltip>
      )}

      {/* Theme toggle */}
      <Tooltip
        title={theme === "vs-dark" ? "Switch to light" : "Switch to dark"}
        placement="bottom"
      >
        <button
          id="cv-toolbar-theme"
          className="cv-toolbar__btn"
          onClick={onThemeToggle}
          aria-label="Toggle editor theme"
        >
          {theme === "vs-dark" ? <SunOutlined /> : <MoonOutlined />}
        </button>
      </Tooltip>

      <div className="cv-toolbar__divider" />

      {/* Copy */}
      <Tooltip title="Copy file" placement="bottom">
        <button
          id="cv-toolbar-copy"
          className="cv-toolbar__btn"
          onClick={handleCopy}
          disabled={!activeContent}
          aria-label="Copy file content"
        >
          <CopyOutlined />
        </button>
      </Tooltip>

      {/* Download */}
      <Tooltip title={downloadTooltip} placement="bottom">
        <button
          id="cv-toolbar-download"
          className="cv-toolbar__btn cv-toolbar__btn--primary"
          onClick={handleDownload}
          disabled={!activeFile}
          aria-label={downloadTooltip}
        >
          <DownloadOutlined />
        </button>
      </Tooltip>
    </div>
  );
}
