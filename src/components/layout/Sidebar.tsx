/**
 * Sidebar Component - Navigation for sections
 */

import { useState, useMemo } from 'react';
import { navbarConfig, componentConfigs } from '../../config/registry';
import type { SidebarProps, SectionConfig } from '../../types';

interface SectionWithMatches extends SectionConfig {
  matchingGrids: string[] | null;
}

interface SectionButtonProps {
  section: SectionConfig | SectionWithMatches;
  isActive: boolean;
  onClick: () => void;
  indent?: boolean;
}

function SectionButton({ section, isActive, onClick, indent = false }: SectionButtonProps): JSX.Element {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const matchingGrids = 'matchingGrids' in section ? section.matchingGrids : null;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'block',
        width: '100%',
        padding: indent ? '8px 12px 8px 28px' : '8px 12px 8px 16px',
        border: 'none',
        background: isActive ? '#3b82f6' : isHovered ? '#374151' : 'transparent',
        color: isActive ? '#ffffff' : isHovered ? '#ffffff' : '#d1d5db',
        fontSize: '13px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background-color 0.1s, color 0.1s',
      }}
    >
      <div>{section.label}</div>
      {matchingGrids && matchingGrids.length > 0 && (
        <div
          style={{
            fontSize: '10px',
            color: '#9ca3af',
            marginTop: '2px',
          }}
        >
          → {matchingGrids.join(', ')}
        </div>
      )}
    </button>
  );
}

function Sidebar({ currentSection, onSectionChange }: SidebarProps): JSX.Element {
  const { groups } = navbarConfig;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupLabel: string): void => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  // Flatten all sections for search
  const allSections = useMemo(() => {
    return groups.flatMap((group) => group.sections);
  }, [groups]);

  const filteredSections = useMemo((): SectionWithMatches[] | null => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: SectionWithMatches[] = [];

    allSections.forEach((section) => {
      const sectionMatches = section.label.toLowerCase().includes(query);

      let gridMatches = false;
      const matchingGrids: string[] = [];

      if (section.layout) {
        section.layout.forEach((item) => {
          const componentConfig = componentConfigs[item.component];
          if (componentConfig?.label?.toLowerCase().includes(query)) {
            gridMatches = true;
            matchingGrids.push(componentConfig.label);
          }
        });
      }

      if (sectionMatches || gridMatches) {
        results.push({
          ...section,
          matchingGrids: gridMatches ? matchingGrids : null,
        });
      }
    });

    return results;
  }, [searchQuery, allSections]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <nav
      style={{
        width: '220px',
        backgroundColor: '#1f2937',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #374151',
        }}
      >
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 700,
            margin: 0,
          }}
        >
          RPM Exotics
        </h1>
      </div>

      <div style={{ padding: '12px 12px 8px' }}>
        <input
          type="text"
          placeholder="Search sections & components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#374151',
            color: '#ffffff',
            fontSize: '13px',
            outline: 'none',
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0',
        }}
      >
        {isSearching ? (
          <div>
            {filteredSections && filteredSections.length > 0 ? (
              filteredSections.map((section) => (
                <SectionButton
                  key={section.id}
                  section={section}
                  isActive={currentSection === section.id}
                  onClick={() => {
                    onSectionChange(section.id);
                    setSearchQuery('');
                  }}
                />
              ))
            ) : (
              <div
                style={{
                  padding: '16px',
                  color: '#9ca3af',
                  fontSize: '12px',
                  textAlign: 'center',
                }}
              >
                No sections found
              </div>
            )}
          </div>
        ) : (
          groups.map((group) => {
            const isExpanded = expandedGroups[group.label] ?? false;
            const hasActiveSection = group.sections.some((s) => s.id === currentSection);

            return (
              <div key={group.label} style={{ marginBottom: '4px' }}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    color: hasActiveSection ? '#ffffff' : '#9ca3af',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '8px',
                      transition: 'transform 0.15s',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▶
                  </span>
                  {group.label}
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '10px',
                      color: '#6b7280',
                    }}
                  >
                    {group.sections.length}
                  </span>
                </button>

                {isExpanded &&
                  group.sections.map((section) => (
                    <SectionButton
                      key={section.id}
                      section={section}
                      isActive={currentSection === section.id}
                      onClick={() => onSectionChange(section.id)}
                      indent
                    />
                  ))}
              </div>
            );
          })
        )}
      </div>
    </nav>
  );
}

export default Sidebar;
