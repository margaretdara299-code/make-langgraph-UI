/**
 * CodeViewerModal — VS Code-style read-only code viewer.
 *
 * Orchestrates all state and composes sub-components:
 *   FileSidebar → EditorTabs + ViewerToolbar → EditorPane / SplitEditorLayout
 *
 * Props are fully backward-compatible with the original interface.
 * No footer, no title bar — all chrome lives inside the modal body.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import type { CodeViewerModalProps } from "@/interfaces";

import FileSidebar from "./FileSidebar";
import EditorTabs from "./EditorTabs";
import EditorPane from "./EditorPane";
import SplitEditorLayout from "./SplitEditorLayout";
import ViewerToolbar from "./ViewerToolbar";

import "./CodeViewerModal.css";

/** Maximum number of open tabs before oldest is evicted */
const MAX_OPEN_TABS = 10;

export default function CodeViewerModal({
  isOpen,
  code,
  onClose,
  fileName = "workflow.py",
}: CodeViewerModalProps) {
  // ─── Derived file map ───────────────────────────────────────────────────
  const files = useMemo<Record<string, string>>(() => {
    if (typeof code === "string") return { [fileName]: code };
    return code ?? {};
  }, [code, fileName]);

  const fileNames = useMemo(() => Object.keys(files), [files]);
  const hasMultipleFiles = fileNames.length > 1;

  // ─── Core state ─────────────────────────────────────────────────────────
  const [activeFile, setActiveFile] = useState<string>("");
  const [splitFile, setSplitFile] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [isSplitView, setIsSplitView] = useState(false);
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [isMobileView, setIsMobileView] = useState(false);

  // ─── Responsive check ───────────────────────────────────────────────────
  useEffect(() => {
    const checkSize = () => setIsMobileView(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // ─── Initialize / reset when modal opens ────────────────────────────────
  useEffect(() => {
    if (!isOpen || fileNames.length === 0) return;

    const firstFile = fileNames[0];

    setActiveFile((prev) =>
      prev && files[prev] ? prev : firstFile
    );
    setOpenTabs((prev) => {
      const valid = prev.filter((t) => files[t]);
      return valid.length > 0 ? valid : [firstFile];
    });
    setSplitFile(null);
    setIsSplitView(false);
  }, [isOpen, fileNames, files]);

  // ─── Derived values ─────────────────────────────────────────────────────
  const activeContent = activeFile ? (files[activeFile] ?? "") : "";
  const resolvedSplitFile = isSplitView ? (splitFile ?? fileNames[1] ?? fileNames[0] ?? "") : "";

  // ─── Tab helpers ────────────────────────────────────────────────────────
  /**
   * Open a file in the left/main pane.
   * Adds to openTabs if not already present (evicts oldest if MAX exceeded).
   */
  const openFile = useCallback(
    (name: string) => {
      if (!files[name]) return;
      setActiveFile(name);
      setOpenTabs((prev) => {
        if (prev.includes(name)) return prev;
        const next = [...prev, name];
        return next.length > MAX_OPEN_TABS ? next.slice(1) : next;
      });
    },
    [files]
  );

  /**
   * Open a file in the right split pane.
   * Automatically enables split view.
   */
  const openSplitFile = useCallback(
    (name: string) => {
      if (!files[name]) return;
      setSplitFile(name);
      setIsSplitView(true);
    },
    [files]
  );

  /**
   * Close a tab. Falls back to the previous or first available tab.
   */
  const closeTab = useCallback(
    (name: string) => {
      setOpenTabs((prev) => {
        const next = prev.filter((t) => t !== name);
        if (name === activeFile && next.length > 0) {
          const closedIndex = prev.indexOf(name);
          const fallback =
            next[Math.min(closedIndex, next.length - 1)];
          setActiveFile(fallback);
        }
        return next;
      });
    },
    [activeFile]
  );

  /**
   * Toggle split view on/off.
   * On disable, clear split state.
   */
  const handleSplitToggle = useCallback(() => {
    setIsSplitView((prev) => {
      if (prev) {
        setSplitFile(null);
      } else {
        // Default right pane to second file or first file if only one
        setSplitFile(fileNames[1] ?? fileNames[0] ?? "");
      }
      return !prev;
    });
  }, [fileNames]);

  /**
   * Flip between vs-dark and light theme.
   */
  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
  }, []);

  // ─── Modal close ────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setIsSplitView(false);
    setSplitFile(null);
    onClose();
  }, [onClose]);

  // ─── Theme class ────────────────────────────────────────────────────────
  const themeClass = theme === "vs-dark" ? "cv-modal--dark" : "cv-modal--light";
  const titleText = hasMultipleFiles
    ? `${fileNames.length} files`
    : (activeFile || fileName);

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      width={isMobileView ? "97vw" : 1200}
      centered
      destroyOnHidden
      className={`cv-modal ${themeClass}`}
      zIndex={2000}
      footer={null}
      title={null}
      styles={{
        mask: {
          backdropFilter: "blur(6px)",
          background: "rgba(0, 0, 0, 0.5)",
        },
        body: { padding: 0 },
      }}
    >
      <div className="cv-modal__root">

        {/* ── Minimal title bar ───────────────────────────────────────── */}
        <div className="cv-modal__titlebar" aria-label="Code viewer">
          <span className="cv-modal__titlebar-text">
            {titleText}
          </span>
        </div>

        {/* ── Main body ───────────────────────────────────────────────── */}
        <div className={`cv-modal__body${isMobileView ? " cv-modal__body--mobile" : ""}`}>

          {/* Left sidebar — hidden on mobile */}
          {hasMultipleFiles && !isMobileView && (
            <FileSidebar
              files={files}
              activeFile={activeFile}
              splitFile={splitFile}
              isSplitView={isSplitView}
              onFileClick={openFile}
              onFileSplitClick={openSplitFile}
            />
          )}

          {/* Editor area */}
          <div className="cv-modal__editor-area">

            {/* Mobile file picker */}
            {hasMultipleFiles && isMobileView && (
              <div className="cv-modal__mobile-select-wrap">
                <select
                  className="cv-modal__mobile-select"
                  value={activeFile}
                  onChange={(e) => openFile(e.target.value)}
                  aria-label="Select file"
                >
                  {fileNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tab bar + toolbar row */}
            <div className="cv-modal__tab-row">
              <EditorTabs
                openTabs={openTabs}
                activeFile={activeFile}
                splitFile={splitFile}
                isSplitView={isSplitView && !isMobileView}
                onTabClick={openFile}
                onTabClose={closeTab}
                onSplitTabClick={openSplitFile}
                onSplitClose={() => { setIsSplitView(false); setSplitFile(null); }}
                files={files}
              />
              <ViewerToolbar
                theme={theme}
                isSplitView={isSplitView}
                hasMultipleFiles={hasMultipleFiles}
                activeFile={activeFile}
                activeContent={activeContent}
                files={files}
                onThemeToggle={handleThemeToggle}
                onSplitToggle={handleSplitToggle}
              />
            </div>

            {/* Editor body — single or split */}
            <div className="cv-modal__editor-body">
              {isSplitView && !isMobileView && resolvedSplitFile ? (
                <SplitEditorLayout
                  leftFile={activeFile}
                  rightFile={resolvedSplitFile}
                  files={files}
                  theme={theme}
                />
              ) : (
                <EditorPane
                  fileName={activeFile || fileName}
                  content={activeContent}
                  theme={theme}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
