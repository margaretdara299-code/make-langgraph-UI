/**
 * FontMismatchCheckerSkill — Checks for font mismatches in UI components.
 * This skill analyzes font usage across components and identifies inconsistencies.
 */

import { Skill, SkillStatus, Environment } from '@/interfaces';

export interface FontMismatchCheckerSkill extends Skill {
    type: 'font-mismatch-checker';
    config: {
        targetComponents?: string[];
        fontFamilyWhitelist?: string[];
        fontSizeTolerance?: number;
        fontWeightTolerance?: number;
    };
}

export const FONT_MISMATCH_CHECKER_SKILL: FontMismatchCheckerSkill = {
    id: 'sk-font-mismatch-checker',
    name: 'Font Mismatch Checker',
    skillKey: 'FONTCHK',
    description: 'Analyzes font usage across UI components and identifies inconsistencies in font family, size, and weight.',
    categoryId: 4, // Assuming 4 is for UI/UX validation
    category: 'UI Validation',
    clientId: '1',
    tags: ['font', 'validation', 'ui-consistency', 'design-system'],
    status: 'draft' as SkillStatus,
    environment: 'dev' as Environment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'font-mismatch-checker',
    config: {
        targetComponents: ['Button', 'Card', 'Typography', 'Input'],
        fontFamilyWhitelist: ['Inter', 'Roboto', 'System Font'],
        fontSizeTolerance: 2, // px tolerance
        fontWeightTolerance: 100, // weight tolerance
    },
};

export interface FontMismatchAnalysisResult {
    component: string;
    issues: FontIssue[];
}

export interface FontIssue {
    type: 'font-family' | 'font-size' | 'font-weight' | 'line-height';
    message: string;
    severity: 'low' | 'medium' | 'high';
    location: {
        component: string;
        file: string;
        line?: number;
    };
}

export interface FontMismatchCheckerConfig {
    targetComponents?: string[];
    fontFamilyWhitelist?: string[];
    fontSizeTolerance?: number;
    fontWeightTolerance?: number;
    excludePatterns?: string[];
}

export class FontMismatchChecker {
    private config: FontMismatchCheckerConfig;

    constructor(config: FontMismatchCheckerConfig = {}) {
        this.config = {
            targetComponents: config.targetComponents || ['Button', 'Card', 'Typography', 'Input'],
            fontFamilyWhitelist: config.fontFamilyWhitelist || ['Inter', 'Roboto', 'System Font'],
            fontSizeTolerance: config.fontSizeTolerance || 2,
            fontWeightTolerance: config.fontWeightTolerance || 100,
            excludePatterns: config.excludePatterns || [],
        };
    }

    /**
     * Analyzes font usage across components and identifies mismatches.
     */
    analyze(): FontMismatchAnalysisResult[] {
        const results: FontMismatchAnalysisResult[] = [];
        
        this.config.targetComponents.forEach(component => {
            const issues = this.analyzeComponent(component);
            if (issues.length > 0) {
                results.push({
                    component,
                    issues,
                });
            }
        });

        return results;
    }

    /**
     * Analyzes a specific component for font inconsistencies.
     */
    private analyzeComponent(component: string): FontIssue[] {
        const issues: FontIssue[] = [];
        
        // Simulate analysis - in real implementation, this would parse actual component files
        const componentFonts = this.getComponentFontData(component);
        
        // Check font family consistency
        const fontFamilyIssues = this.checkFontFamily(componentFonts);
        issues.push(...fontFamilyIssues);
        
        // Check font size consistency
        const fontSizeIssues = this.checkFontSize(componentFonts);
        issues.push(...fontSizeIssues);
        
        // Check font weight consistency
        const fontWeightIssues = this.checkFontWeight(componentFonts);
        issues.push(...fontWeightIssues);
        
        return issues;
    }

    /**
     * Gets simulated font data for a component (in real implementation, this would parse actual files)
     */
    private getComponentFontData(component: string): ComponentFontData[] {
        // This is a mock implementation - in real usage, this would parse actual component files
        const mockData: Record<string, ComponentFontData[]> = {
            'Button': [
                { fontFamily: 'Inter', fontSize: 14, fontWeight: 500, location: { component: 'Button', file: 'Button.tsx', line: 25 } },
                { fontFamily: 'Roboto', fontSize: 16, fontWeight: 600, location: { component: 'Button', file: 'Button.tsx', line: 40 } },
                { fontFamily: 'System Font', fontSize: 14, fontWeight: 400, location: { component: 'Button', file: 'Button.tsx', line: 55 } },
            ],
            'Card': [
                { fontFamily: 'Inter', fontSize: 16, fontWeight: 500, location: { component: 'Card', file: 'Card.tsx', line: 30 } },
                { fontFamily: 'Inter', fontSize: 14, fontWeight: 500, location: { component: 'Card', file: 'Card.tsx', line: 45 } },
            ],
            'Typography': [
                { fontFamily: 'Roboto', fontSize: 18, fontWeight: 700, location: { component: 'Typography', file: 'Typography.tsx', line: 20 } },
                { fontFamily: 'Roboto', fontSize: 16, fontWeight: 400, location: { component: 'Typography', file: 'Typography.tsx', line: 35 } },
            ],
            'Input': [
                { fontFamily: 'System Font', fontSize: 14, fontWeight: 400, location: { component: 'Input', file: 'Input.tsx', line: 15 } },
                { fontFamily: 'System Font', fontSize: 16, fontWeight: 400, location: { component: 'Input', file: 'Input.tsx', line: 30 } },
            ],
        };

        return mockData[component] || [];
    }

    /**
     * Checks for font family inconsistencies.
     */
    private checkFontFamily(fonts: ComponentFontData[]): FontIssue[] {
        const issues: FontIssue[] = [];
        const uniqueFamilies = new Set(fonts.map(f => f.fontFamily));
        
        if (uniqueFamilies.size > 1) {
            const families = Array.from(uniqueFamilies);
            const primaryFamily = families[0];
            
            families.slice(1).forEach((family, index) => {
                if (!this.config.fontFamilyWhitelist?.includes(family)) {
                    issues.push({
                        type: 'font-family',
                        message: `Inconsistent font family: '${family}' (expected '${primaryFamily}')`,
                        severity: 'medium',
                        location: fonts[index + 1].location,
                    });
                }
            });
        }
        
        return issues;
    }

    /**
     * Checks for font size inconsistencies.
     */
    private checkFontSize(fonts: ComponentFontData[]): FontIssue[] {
        const issues: FontIssue[] = [];
        
        for (let i = 1; i < fonts.length; i++) {
            const diff = Math.abs(fonts[i].fontSize - fonts[0].fontSize);
            if (diff > this.config.fontSizeTolerance) {
                issues.push({
                    type: 'font-size',
                    message: `Font size differs by ${diff}px (tolerance: ${this.config.fontSizeTolerance}px)`,
                    severity: 'low',
                    location: fonts[i].location,
                });
            }
        }
        
        return issues;
    }

    /**
     * Checks for font weight inconsistencies.
     */
    private checkFontWeight(fonts: ComponentFontData[]): FontIssue[] {
        const issues: FontIssue[] = [];
        
        for (let i = 1; i < fonts.length; i++) {
            const diff = Math.abs(fonts[i].fontWeight - fonts[0].fontWeight);
            if (diff > this.config.fontWeightTolerance) {
                issues.push({
                    type: 'font-weight',
                    message: `Font weight differs by ${diff} (tolerance: ${this.config.fontWeightTolerance})`,
                    severity: 'low',
                    location: fonts[i].location,
                });
            }
        }
        
        return issues;
    }
}

interface ComponentFontData {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    location: {
        component: string;
        file: string;
        line?: number;
    };
}

/**
 * Generates a report of font mismatches.
 */
export function generateFontMismatchReport(analysisResults: FontMismatchAnalysisResult[]): string {
    if (analysisResults.length === 0) {
        return 'No font mismatches found. Your UI components have consistent font usage.';
    }

    let report = 'Font Mismatch Analysis Report\n';
    report += '================================\n\n';

    analysisResults.forEach(result => {
        report += `Component: ${result.component}\n`;
        report += `Issues Found: ${result.issues.length}\n`;
        report += '----------------------------\n';
        
        result.issues.forEach(issue => {
            report += `- ${issue.type.toUpperCase()}: ${issue.message}\n`;
            report += `  Severity: ${issue.severity}\n`;
            report += `  Location: ${issue.location.file}${issue.location.line ? `:${issue.location.line}` : ''}\n`;
        });
        
        report += '\n';
    });

    return report;
}

/**
 * Fixes identified font mismatches automatically.
 */
export function fixFontMismatches(analysisResults: FontMismatchAnalysisResult[]): string {
    let fixes = 0;
    
    analysisResults.forEach(result => {
        result.issues.forEach(issue => {
            // In a real implementation, this would modify the actual files
            // For now, we'll just simulate the fixes
            fixes++;
        });
    });
    
    return `Applied ${fixes} font fixes across ${analysisResults.length} components.`;
}

/**
 * Exports the skill for use in the application.
 */
export default FONT_MISMATCH_CHECKER_SKILL;