/**
 * SplitEditorLayout — Side-by-side dual read-only editor panes.
 *
 * Used when split view is enabled. Each pane receives its own EditorPane
 * instance with a LEFT / RIGHT label pill so the user knows which pane is which.
 * No drag-to-resize — keeps the implementation clean and dependency-free.
 */

import EditorPane from "./EditorPane";

interface SplitEditorLayoutProps {
  /** File name to render in the left pane */
  leftFile: string;
  /** File name to render in the right pane */
  rightFile: string;
  /** All files map */
  files: Record<string, string>;
  /** Monaco theme */
  theme: "vs-dark" | "light";
}

export default function SplitEditorLayout({
  leftFile,
  rightFile,
  files,
  theme,
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
        />
      </div>
    </div>
  );
}
