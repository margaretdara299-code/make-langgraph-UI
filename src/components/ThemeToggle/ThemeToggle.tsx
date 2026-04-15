import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import './ThemeToggle.css';

interface ThemeToggleProps {
  collapsed?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ collapsed }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`theme-toggle-container ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className="theme-toggle-btn" 
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <div className={`icon-wrapper ${isDark ? 'dark' : 'light'}`}>
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </div>
        {!collapsed && (
          <span className="toggle-label">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
