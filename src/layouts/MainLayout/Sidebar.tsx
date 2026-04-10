import { NavLink } from "react-router-dom";
import { ChevronLeft, LogOut } from "lucide-react";
import { SIDEBAR_MENU_ITEMS } from "@/constants/layout.constants";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className={`main-sidebar ${collapsed ? "collapsed" : ""} reveal-slide`}
    >
      <div className="brand-section">
        <div className="brand-logo-container">
          <img
            src="/tensawLogo.jpg"
            alt="Tensaw Logo"
            className="brand-logo-img"
          />
        </div>
        {!collapsed && <span className="brand-name">Tensaw Studio</span>}
        <button className="sidebar-toggle" onClick={onToggle}>
          <ChevronLeft />
        </button>
      </div>

      <nav className="nav-links">
        {SIDEBAR_MENU_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.key}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user-section">
        <div className="user-info-row">
          <div className="user-avatar-small">U</div>
          {!collapsed && (
            <div className="user-details">
              <span className="user-name">User</span>
              <span className="user-badge">PRO</span>
            </div>
          )}
          {!collapsed && (
            <button
              className="minimal-logout-btn"
              title="Logout"
              onClick={onLogout}
            >
              <LogOut />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
