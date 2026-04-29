import React, { useState, useMemo } from 'react';
import { Input, Popover, Empty, Tooltip, Button, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import * as LucideIcons from 'lucide-react';
import './LucideIconPicker.css';

// Define categories based on keyword mappings
// Map official Lucide categories to search keywords for automatic grouping
const ICON_CATEGORIES = [
    { label: 'Accessibility', value: 'accessibility', keywords: ['Accessibility', 'Hand', 'Eye', 'Audio', 'Braille', 'Aed', 'Glasses'] },
    { label: 'Accounts & access', value: 'accounts', keywords: ['User', 'Key', 'Lock', 'Shield', 'Fingerprint', 'Log'] },
    { label: 'Animals', value: 'animals', keywords: ['Cat', 'Dog', 'Bird', 'Rabbit', 'Fish', 'Paw', 'Snail', 'Squirrel', 'Turtle', 'Pig'] },
    { label: 'Arrows', value: 'arrows', keywords: ['Arrow', 'Chevron', 'Move', 'Expand', 'Shrink', 'Iteration', 'Refresh', 'Rotate'] },
    { label: 'Buildings', value: 'buildings', keywords: ['Building', 'Home', 'House', 'Hospital', 'Store', 'Factory', 'Church', 'Warehouse'] },
    { label: 'Charts', value: 'charts', keywords: ['Chart', 'Bar', 'Line', 'Pie', 'Activity', 'Trending', 'Area', 'Component'] },
    { label: 'Communication', value: 'communication', keywords: ['Message', 'Mail', 'Phone', 'Send', 'Share', 'Inbox', 'Speech', 'Contact'] },
    { label: 'Connectivity', value: 'connectivity', keywords: ['Wifi', 'Network', 'Bluetooth', 'Link', 'Cloud', 'Signal', 'HardDrive', 'Ethernet'] },
    { label: 'Cursors', value: 'cursors', keywords: ['Mouse', 'Pointer', 'Cursor', 'Hand', 'Click', 'Touch'] },
    { label: 'Design', value: 'design', keywords: ['Pen', 'Brush', 'Layers', 'Layout', 'Square', 'Circle', 'Triangle', 'Paint', 'Palette', 'Text'] },
    { label: 'Coding', value: 'coding', keywords: ['Code', 'Git', 'Terminal', 'Braces', 'Database', 'Variable', 'Command', 'Script', 'Binary'] },
    { label: 'Devices', value: 'devices', keywords: ['Laptop', 'Smartphone', 'Monitor', 'Watch', 'Tablet', 'Cpu', 'Mouse', 'Printer', 'Usb'] },
    { label: 'Finance', value: 'finance', keywords: ['Cart', 'Credit', 'Bank', 'Wallet', 'Store', 'Tag', 'Dollar', 'Coins', 'Trophy', 'Euro'] },
    { label: 'Food & beverage', value: 'food', keywords: ['Coffee', 'Beer', 'Wine', 'Utensils', 'Pizza', 'Soup', 'Apple', 'Banana', 'IceCream'] },
    { label: 'Gaming', value: 'gaming', keywords: ['Gamepad', 'Dices', 'Trophy', 'Swords', 'Gem', 'Ghost', 'Skull', 'Joystick'] },
    { label: 'Home', value: 'home', keywords: ['Lamp', 'Bed', 'Sofa', 'Bath', 'Microwave', 'Refrigerator', 'WashingMachine', 'Tv'] },
    { label: 'Layout', value: 'layout', keywords: ['Columns', 'Grid', 'Panel', 'Split', 'Maximize', 'Minimize', 'Align', 'Stretch'] },
    { label: 'Medical', value: 'medical', keywords: ['Hospital', 'Stethoscope', 'Syringe', 'Pill', 'Thermometer', 'HeartPulse', 'Dna', 'Brain'] },
    { label: 'Multimedia', value: 'multimedia', keywords: ['Play', 'Pause', 'Music', 'Volume', 'Scan', 'Camera', 'Video', 'Image', 'Mic', 'Headphones'] },
    { label: 'Navigation', value: 'navigation', keywords: ['Map', 'Pin', 'Compass', 'Globe', 'Navigation', 'Flag', 'Locate', 'Milestone'] },
    { label: 'Security', value: 'security', keywords: ['Shield', 'Lock', 'Key', 'Fingerprint', 'FileKey', 'Eye', 'EyeOff', 'ScanFace'] },
    { label: 'Social', value: 'social', keywords: ['Share', 'Send', 'Heart', 'ThumbsUp', 'User', 'Users', 'Speech', 'Message'] },
    { label: 'Text formatting', value: 'text', keywords: ['Type', 'Bold', 'Italic', 'Underline', 'Strikethrough', 'Heading', 'List', 'Quotes', 'Align'] },
    { label: 'Time & calendar', value: 'time', keywords: ['Clock', 'Calendar', 'History', 'Timer', 'Watch', 'Alarm', 'Hourglass'] },
    { label: 'Tools', value: 'tools', keywords: ['Tool', 'Settings', 'Hammer', 'Wrench', 'Screwdriver', 'Nut', 'Drill', 'Axe', 'Pickaxe'] },
    { label: 'Transportation', value: 'transport', keywords: ['Car', 'Bike', 'Bus', 'Plane', 'Train', 'Ship', 'Truck', 'Tractor', 'Rocket'] },
    { label: 'Weather', value: 'weather', keywords: ['Sun', 'Moon', 'Cloud', 'Rain', 'Snow', 'Wind', 'Temp', 'Thermometer', 'Sunrise', 'Sunset'] },
    { label: 'Folders & Groups', value: 'folders', keywords: ['Folder', 'Archive', 'Package', 'Container', 'Box', 'Bundle', 'Collection', 'Library'] }
];


// Extract all valid icon names from the library
const ALL_ICON_NAMES = Object.keys(LucideIcons).filter(key => {
    return /^[A-Z]/.test(key) && typeof (LucideIcons as any)[key] !== 'undefined';
});

// Internal singleton state to prevent redundant heavy calculations
let isInitialized = false;
const PRECOMPUTED_CATEGORY_COUNTS: Record<string, number> = {};
let CURATED_ICON_NAMES: string[] = []; // Only icons belonging to at least one category
const ICON_TO_CATEGORIES_MAP = new Map<string, string[]>();

const initializeIconMetadata = () => {
    if (isInitialized) return;
    
    // 1. Identify which icons belong to which categories
    ALL_ICON_NAMES.forEach(name => {
        const categories: string[] = [];
        ICON_CATEGORIES.forEach(cat => {
            if (cat.keywords.some(kw => name.includes(kw))) {
                categories.push(cat.value);
            }
        });
        
        if (categories.length > 0) {
            ICON_TO_CATEGORIES_MAP.set(name, categories);
            CURATED_ICON_NAMES.push(name);
        }
    });

    // 2. Pre-calculate counts based on CURATED set
    ICON_CATEGORIES.forEach(cat => {
        PRECOMPUTED_CATEGORY_COUNTS[cat.value] = CURATED_ICON_NAMES.filter(name => 
            ICON_TO_CATEGORIES_MAP.get(name)?.includes(cat.value)
        ).length;
    });

    isInitialized = true;
};

// Background Silent Pre-warming:
// Initializes the metadata in idle time so it's ready before the user clicks
if (typeof window !== 'undefined') {
    const preWarm = () => {
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => initializeIconMetadata());
        } else {
            setTimeout(initializeIconMetadata, 2000);
        }
    };
    
    // Run pre-warm slightly after initial load
    if (document.readyState === 'complete') {
        preWarm();
    } else {
        window.addEventListener('load', preWarm);
    }
}

export interface LucideIconPickerProps {
    value?: string;
    onChange?: (iconName: string) => void;
    placeholder?: string;
    iconOnly?: boolean;
}

export const DynamicLucideIcon = ({ name, size = 18, color = 'currentColor', strokeWidth = 2, ...props }: { name?: string; size?: number; color?: string; strokeWidth?: number; [key: string]: any }) => {
    const IconComponent = (LucideIcons as any)[name || 'HelpCircle'] || LucideIcons.HelpCircle;
    return <IconComponent size={size} color={color} strokeWidth={strokeWidth} {...props} />;
};

export const LucideIconPicker: React.FC<LucideIconPickerProps> = ({ value, onChange, placeholder = 'Select Icon', iconOnly = true }) => {

    // Initialize metadata lazily on first use
    initializeIconMetadata();

    const [searchValue, setSearchValue] = useState('');
    const [category, setCategory] = useState(ICON_CATEGORIES[0].value);
    const [isOpen, setIsOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(100);

    // Reset pagination when filter changes
    React.useEffect(() => {
        setVisibleCount(100);
    }, [searchValue, category]);

    const { displayedIcons, totalMatches } = useMemo(() => {
        let results = CURATED_ICON_NAMES;

        // Apply Category Filter using indexed map (Super Fast)
        results = results.filter(name => {
            const iconCats = ICON_TO_CATEGORIES_MAP.get(name);
            return iconCats && iconCats.includes(category);
        });

        // Apply Search Filter (Search still scans ALL icons to ensure user finds what they need)
        const query = searchValue.toLowerCase();
        if (query) {
            // When searching, we allow searching through the entire library
            results = ALL_ICON_NAMES.filter(name => name.toLowerCase().includes(query));
            
            // Further restrict search results to current category
            results = results.filter(name => {
                const iconCats = ICON_TO_CATEGORIES_MAP.get(name);
                return iconCats && iconCats.includes(category);
            });
        }

        return {
            displayedIcons: results.slice(0, visibleCount),
            totalMatches: results.length
        };
    }, [searchValue, category, visibleCount]);

    // Infinite scroll observer
    const observerTarget = React.useRef(null);
    React.useEffect(() => {
        if (!isOpen) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && displayedIcons.length < totalMatches) {
                    setVisibleCount(prev => prev + 100);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [isOpen, displayedIcons.length, totalMatches]);

    const content = (
        <div className="lucide-icon-picker-popover">
            <div className="picker-search-header">
                <div className="picker-header-row">
                    <div className="picker-control-group picker-category-control">
                        <span className="picker-control-label">Category</span>
                        <Select 
                            size="small"
                            value={category}
                            onChange={setCategory}
                            className="picker-category-select"
                            options={ICON_CATEGORIES.map(c => ({ 
                                label: `${c.label} (${PRECOMPUTED_CATEGORY_COUNTS[c.value] || 0})`, 
                                value: c.value 
                            }))}
                            dropdownClassName="picker-category-dropdown"
                        />
                    </div>
                    <div className="picker-control-group picker-search-control">
                        <span className="picker-control-label">Search</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Input
                                prefix={<LucideIcons.Search size={12} className="lip-search-icon" />}
                                placeholder={`Find ${category}...`}
                                variant="filled"
                                size="small"
                                value={searchValue}
                                onChange={e => setSearchValue(e.target.value)}
                                autoFocus
                                className="picker-search-input"
                            />
                            {value && (
                                <Tooltip title="Clear selection">
                                    <Button 
                                        size="small" 
                                        type="text" 
                                        icon={<LucideIcons.X size={14} />} 
                                        onClick={() => {
                                            onChange?.('');
                                            setIsOpen(false);
                                        }}
                                        className="picker-clear-btn"
                                    />
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="picker-grid-container">
                {displayedIcons.length > 0 ? (
                    <div className="icon-picker-grid">
                        {displayedIcons.map(name => (
                            <div 
                                key={name}
                                className={`icon-option ${value === name ? 'active' : ''}`}
                                onClick={() => {
                                    onChange?.(name);
                                    setIsOpen(false);
                                }}
                            >
                                <DynamicLucideIcon name={name} size={20} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No icons found" />
                )}
                {/* Sentinel element for infinite scroll */}
                <div ref={observerTarget} className="picker-scroll-sentinel" />
            </div>
            
            <div className="picker-footer-tip">
                {totalMatches > displayedIcons.length ? (
                    `Showing ${displayedIcons.length} of ${totalMatches} icons. Scroll for more.`
                ) : (
                    `Found ${totalMatches} icons.`
                )}
            </div>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={isOpen}
            onOpenChange={setIsOpen}
            placement="bottomLeft"
            overlayClassName="premium-icon-picker-overlay"
        >
            <Button 
                className={`lucide-picker-trigger ${iconOnly ? 'icon-only' : ''} ${isOpen ? 'is-open' : ''}`} 
                variant="filled"
            >
                <div className="picker-trigger-inner">
                    <div className="selected-icon-preview">
                        {value ? (
                            <DynamicLucideIcon name={value} size={iconOnly ? 28 : 20} color="var(--accent)" strokeWidth={2.5} />
                        ) : (
                            <LucideIcons.Plus size={iconOnly ? 28 : 20} color="var(--accent)" strokeWidth={2.5} />
                        )}
                    </div>
                    {!iconOnly && (
                        <span style={{ marginLeft: '8px', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-main)' }}>
                            {value || placeholder}
                        </span>
                    )}
                </div>
            </Button>
        </Popover>
    );
};

export default LucideIconPicker;
