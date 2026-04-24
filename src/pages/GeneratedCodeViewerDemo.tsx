/**
 * Example/Demo page for GeneratedCodeViewer component
 * This demonstrates how to use the VS Code-style file explorer popup
 */

import { useState } from "react";
import { Button, Space } from "antd";
import { CodeOutlined, FolderOutlined } from "@ant-design/icons";
import { GeneratedCodeViewer } from "@/components";
import './GeneratedCodeViewerDemo.css';

export default function GeneratedCodeViewerDemo() {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <div className="gcv-demo-page">
      <div className="gcv-demo-container">
        <h1>Generated Code Viewer — VS Code Style</h1>
        <p>
          View auto-generated project files from the Tensaw Skill Studio in a VS
          Code-like interface with file explorer on the left and code viewer on
          the right.
        </p>

        {/* Demo Buttons */}
        <Space
          direction="vertical"
          className="gcv-demo-space"
        >
          <div>
            <h3>Demo: View Skill #18 Generated Code</h3>
            <Button
              type="primary"
              size="large"
              icon={<CodeOutlined />}
              onClick={() => setIsViewerOpen(true)}
            >
              Open Code Viewer
            </Button>
          </div>

          <div className="gcv-demo-features-card">
            <h3>Features:</h3>
            <ul>
              <li>✅ File explorer panel on the left (like VS Code)</li>
              <li>✅ Code viewer with syntax highlighting on the right</li>
              <li>✅ Click files to view their content</li>
              <li>✅ Copy code to clipboard</li>
              <li>✅ Download individual files</li>
              <li>✅ Download all files at once</li>
              <li>✅ Automatic language detection based on file extension</li>
              <li>✅ VS Code dark theme styling</li>
              <li>✅ Responsive design (mobile-friendly)</li>
            </ul>
          </div>

          <div className="gcv-demo-code-card">
            <h3>Usage Example:</h3>
            <pre className="gcv-demo-code-block">
              {`import { GeneratedCodeViewer } from '@/components';
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
}`}
            </pre>
          </div>

          <div className="gcv-demo-code-card">
            <h3>Component Props:</h3>
            <table className="gcv-demo-props-table">
              <thead>
                <tr className="gcv-demo-table-head-row">
                  <th className="gcv-demo-th">Prop</th>
                  <th className="gcv-demo-th">Type</th>
                  <th className="gcv-demo-th">Default</th>
                  <th className="gcv-demo-th">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="gcv-demo-table-row">
                   <td className="gcv-demo-td">isOpen</td>
                   <td className="gcv-demo-td">boolean</td>
                   <td className="gcv-demo-td">—</td>
                   <td className="gcv-demo-td">Controls modal visibility</td>
                 </tr>
                 <tr className="gcv-demo-table-row">
                   <td className="gcv-demo-td">onClose</td>
                   <td className="gcv-demo-td">() =&gt; void</td>
                   <td className="gcv-demo-td">—</td>
                   <td className="gcv-demo-td">
                     Callback when closing modal
                   </td>
                 </tr>
                 <tr className="gcv-demo-table-row">
                   <td className="gcv-demo-td">skillId</td>
                   <td className="gcv-demo-td">string | number</td>
                   <td className="gcv-demo-td">"18"</td>
                   <td className="gcv-demo-td">Skill ID to fetch code for</td>
                 </tr>
                 <tr className="gcv-demo-table-row">
                   <td className="gcv-demo-td">apiBaseUrl</td>
                   <td className="gcv-demo-td">string</td>
                   <td className="gcv-demo-td">"http://localhost:8000"</td>
                   <td className="gcv-demo-td">API base URL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Space>
      </div>

      {/* The actual component */}
      <GeneratedCodeViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        skillId="18"
        apiBaseUrl="http://localhost:8000"
      />
    </div>
  );
}
