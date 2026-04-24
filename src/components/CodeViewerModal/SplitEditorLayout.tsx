/**
 * SplitEditorLayout — Side-by-side dual read-only editor panes.
 *
 * Each pane is an independent editor group (VS Code model).
 * Clicking inside a pane fires onLeftPaneFocus / onRightPaneFocus
 * to move keyboard/sidebar focus to that group.
 */

import EditorPane from "./EditorPane";

interface SplitEditorLayoutProps {
  /** File name in the left editor group */
  leftFile: string;
  /** File name in the right editor group */
  rightFile: string;
  /** All files map */
  files: Record<string, string>;
  /** Monaco theme */
  theme: "vs-dark" | "light";
  /** Which pane is currently the focused editor group */
  focusedPane: "left" | "right";
  /** Called when user clicks inside the left pane */
  onLeftPaneFocus: () => void;
  /** Called when user clicks inside the right pane */
  onRightPaneFocus: () => void;
}

export default function SplitEditorLayout({
  leftFile,
  rightFile,
  files,
  theme,
  focusedPane,
  onLeftPaneFocus,
  onRightPaneFocus,
}: SplitEditorLayoutProps) {
  const leftContent = files[leftFile] ?? "";
  const rightContent = files[rightFile] ?? "";

  return (
    <div className="cv-split">
      {/* Left pane */}
      <div className="cv-split__pane cv-split__pane--left">
        <EditorPane
          fileName={leftFile}
          content={leftContent}
          theme={theme}
          label="LEFT"
          isFocused={focusedPane === "left"}
          onPaneFocus={onLeftPaneFocus}
        />
      </div>

      {/* Vertical divider */}
      <div className="cv-split__divider" aria-hidden="true" />

      {/* Right pane */}
      <div className="cv-split__pane cv-split__pane--right">
        <EditorPane
          fileName={rightFile}
          content={rightContent}
          theme={theme}
          label="RIGHT"
          isFocused={focusedPane === "right"}
          onPaneFocus={onRightPaneFocus}
        />
      </div>
    </div>
  );
}
