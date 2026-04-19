/**
 * CodeViewerModal — VS Code-style read-only code viewer.
 *
 * Orchestrates all state and composes sub-components:
 *   FileSidebar → EditorTabs + ViewerToolbar → EditorPane / SplitEditorLayout
 *
 * Supports independent left and right editor groups (tabs and active file),
 * just like real VS Code.
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

/** Maximum number of open tabs per group before oldest is evicted */
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
  const [leftActiveFile, setLeftActiveFile] = useState<string>("");
  const [rightActiveFile, setRightActiveFile] = useState<string>("");
  
  const [leftTabs, setLeftTabs] = useState<string[]>([]);
  const [rightTabs, setRightTabs] = useState<string[]>([]);

  const [isSplitView, setIsSplitView] = useState(false);
  const [focusedPane, setFocusedPane] = useState<"left" | "right">("left");

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

    setLeftActiveFile((prev) => (prev && files[prev] ? prev : firstFile));
    setLeftTabs((prev) => {
      const valid = prev.filter((t) => files[t]);
      return valid.length > 0 ? valid : [firstFile];
    });

    setRightActiveFile("");
    setRightTabs([]);
    setIsSplitView(false);
    setFocusedPane("left");
  }, [isOpen, fileNames, files]);

  // ─── Derived values ─────────────────────────────────────────────────────
  // Ensure the active file actually gets content. Fallback to empty if missing.
  const activeLeftContent = leftActiveFile && files[leftActiveFile] ? files[leftActiveFile] : "";
  const activeRightContent = rightActiveFile && files[rightActiveFile] ? files[rightActiveFile] : "";

  // The active file conceptually used by download/copy toolbar (based on focused pane)
  const currentFocusedFile = focusedPane === "right" && isSplitView ? rightActiveFile : leftActiveFile;
  const currentFocusedContent = focusedPane === "right" && isSplitView ? activeRightContent : activeLeftContent;

  // ─── Tab helpers ────────────────────────────────────────────────────────

  /**
   * Helper to add a tab to a list with max limit check.
   */
  const addTab = (prev: string[], name: string) => {
    if (prev.includes(name)) return prev;
    const next = [...prev, name];
    return next.length > MAX_OPEN_TABS ? next.slice(1) : next;
  };

  /**
   * Helper to remove a tab and fallback to another if active.
   */
  const removeTab = (
    prevTabs: string[],
    nameToRemove: string,
    activeName: string,
    setActiveFn: (name: string) => void
  ) => {
    const next = prevTabs.filter((t) => t !== nameToRemove);
    if (nameToRemove === activeName) {
      if (next.length > 0) {
        const closedIndex = prevTabs.indexOf(nameToRemove);
        const fallback = next[Math.min(closedIndex, next.length - 1)];
        setActiveFn(fallback);
      } else {
        setActiveFn(""); // No tabs left
      }
    }
    return next;
  };

  /**
   * Open a file from the sidebar into the currently focused pane.
   */
  const openFileFromSidebar = useCallback(
    (name: string) => {
      if (!files[name]) return;

      if (focusedPane === "right" && isSplitView) {
        setRightActiveFile(name);
        setRightTabs((prev) => addTab(prev, name));
      } else {
        setLeftActiveFile(name);
        setLeftTabs((prev) => addTab(prev, name));
        // If split view but left was clicked, ensure focus returns to left
        setFocusedPane("left");
      }
    },
    [files, focusedPane, isSplitView]
  );

  /**
   * Open a file in the left pane (e.g. from left tab strip).
   */
  const openLeftTab = useCallback(
    (name: string) => {
      if (!files[name]) return;
      setLeftActiveFile(name);
      setLeftTabs((prev) => addTab(prev, name));
      setFocusedPane("left");
    },
    [files]
  );

  /**
   * Open a file in the right pane (e.g. from right tab strip or 'open in split').
   */
  const openRightTab = useCallback(
    (name: string) => {
      if (!files[name]) return;
      setRightActiveFile(name);
      setRightTabs((prev) => addTab(prev, name));
      setIsSplitView(true);
      setFocusedPane("right");
    },
    [files]
  );

  /**
   * Close a tab in the left pane.
   */
  const closeLeftTab = useCallback(
    (name: string) => {
      setLeftTabs((prev) => removeTab(prev, name, leftActiveFile, setLeftActiveFile));
    },
    [leftActiveFile]
  );

  /**
   * Close a tab in the right pane.
   * If it's the last right tab, collapse the split view automatically.
   */
  const closeRightTab = useCallback(
    (name: string) => {
      setRightTabs((prev) => {
        const next = removeTab(prev, name, rightActiveFile, setRightActiveFile);
        if (next.length === 0) {
          setIsSplitView(false);
          setFocusedPane("left");
        }
        return next;
      });
    },
    [rightActiveFile]
  );

  /**
   * Toggle split view on/off via toolbar.
   */
  const handleSplitToggle = useCallback(() => {
    setIsSplitView((prev) => {
      if (prev) {
        // Turning off
        setFocusedPane("left");
        return false;
      } else {
        // Turning on
        // Real VS Code populates the new split with a copy of the currently active file
        const fileToSplit = leftActiveFile || fileNames[0] || "";
        if (fileToSplit) {
          setRightActiveFile(fileToSplit);
          setRightTabs((tabs) => addTab(tabs, fileToSplit));
        }
        setFocusedPane("right");
        return true;
      }
    });
  }, [leftActiveFile, fileNames]);

  /**
   * Flip between vs-dark and light theme.
   */
  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
  }, []);

  // ─── Modal close ────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setIsSplitView(false);
    onClose();
  }, [onClose]);

  // ─── Theme class ────────────────────────────────────────────────────────
  const themeClass = theme === "vs-dark" ? "cv-modal--dark" : "cv-modal--light";
  const titleText = hasMultipleFiles
    ? `${fileNames.length} files`
    : (leftActiveFile || fileName);

  // ─── Sidebar selection mapping ──────────────────────────────────────────
  // The sidebar should highlight the file active in the focused pane.
  // We can treat leftActiveFile as the "active" and rightActiveFile as "splitActive"
  // just so it shows both in the sidebar (VS Code highlights the focused one, but showing both is nice).
  const sidebarSelectedFile = focusedPane === "right" && isSplitView ? rightActiveFile : leftActiveFile;
  const sidebarSplitSelectedFile = focusedPane === "left" && isSplitView ? rightActiveFile : null;

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
              activeFile={sidebarSelectedFile}
              splitFile={sidebarSplitSelectedFile}
              isSplitView={isSplitView}
              onFileClick={openFileFromSidebar}
              onFileSplitClick={openRightTab}
            />
          )}

          {/* Editor area */}
          <div className="cv-modal__editor-area">

            {/* Mobile file picker */}
            {hasMultipleFiles && isMobileView && (
              <div className="cv-modal__mobile-select-wrap">
                <select
                  className="cv-modal__mobile-select"
                  value={leftActiveFile}
                  onChange={(e) => openLeftTab(e.target.value)}
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
                leftTabs={leftTabs}
                leftActiveFile={leftActiveFile}
                rightTabs={rightTabs}
                rightActiveFile={rightActiveFile}
                isSplitView={isSplitView && !isMobileView}
                focusedPane={focusedPane}
                onLeftTabClick={openLeftTab}
                onLeftTabClose={closeLeftTab}
                onRightTabClick={openRightTab}
                onRightTabClose={closeRightTab}
              />
              <ViewerToolbar
                theme={theme}
                isSplitView={isSplitView}
                hasMultipleFiles={hasMultipleFiles}
                activeFile={currentFocusedFile}
                activeContent={currentFocusedContent}
                files={files}
                onThemeToggle={handleThemeToggle}
                onSplitToggle={handleSplitToggle}
              />
            </div>

            {/* Editor body — single or split */}
            <div className="cv-modal__editor-body">
              {isSplitView && !isMobileView && rightActiveFile ? (
                <SplitEditorLayout
                  leftFile={leftActiveFile}
                  rightFile={rightActiveFile}
                  files={files}
                  theme={theme}
                  focusedPane={focusedPane}
                  onLeftPaneFocus={() => setFocusedPane("left")}
                  onRightPaneFocus={() => setFocusedPane("right")}
                />
              ) : (
                <EditorPane
                  fileName={leftActiveFile || fileName}
                  content={activeLeftContent}
                  theme={theme}
                  isFocused={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
