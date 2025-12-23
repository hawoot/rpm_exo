/**
 * Sidebar Component - Navigation for sections
 */

import { useState, useMemo } from 'react';
import sectionsIndex from '../../../config/sections/_index.json';
import type { SidebarProps, SectionConfig, SectionsIndex, GridConfig } from '../../types';

import futuresPositionGrid from '../../../config/grids/futures-position.json';
import futuresPnlCard from '../../../config/grids/futures-pnl-card.json';
import futuresDv01Card from '../../../config/grids/futures-dv01-card.json';
import bondsPositionGrid from '../../../config/grids/bonds-position.json';

const typedSectionsIndex = sectionsIndex as SectionsIndex;

const gridConfigs: Record<string, GridConfig> = {
  'futures-position': futuresPositionGrid as GridConfig,
  'futures-pnl-card': futuresPnlCard as GridConfig,
  'futures-dv01-card': futuresDv01Card as GridConfig,
  'bonds-position': bondsPositionGrid as GridConfig,
};

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

function Sidebar({ currentSection, onSectionChange, sectionConfigs }: SidebarProps): JSX.Element {
  const { nav_groups, sections } = typedSectionsIndex;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string): void => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const groupedSections = useMemo(() => {
    const grouped: Record<string, SectionConfig[]> = {};
    nav_groups.forEach((group) => {
      grouped[group.id] = [];
    });

    sections.forEach((sectionId) => {
      const config = sectionConfigs[sectionId];
      const navGroup = config?.nav_group;
      if (config && navGroup && grouped[navGroup]) {
        grouped[navGroup].push(config);
      }
    });

    Object.keys(grouped).forEach((groupId) => {
      const groupArray = grouped[groupId];
      if (groupArray) {
        groupArray.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    });

    return grouped;
  }, [sectionConfigs, nav_groups, sections]);

  const filteredSections = useMemo((): SectionWithMatches[] | null => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: SectionWithMatches[] = [];

    sections.forEach((sectionId) => {
      const config = sectionConfigs[sectionId];
      if (!config) return;

      const sectionMatches = config.label.toLowerCase().includes(query);

      let gridMatches = false;
      const matchingGrids: string[] = [];

      if (config.layout) {
        config.layout.forEach((row) => {
          row.grids?.forEach((gridId) => {
            const gridConfig = gridConfigs[gridId];
            if (gridConfig?.label?.toLowerCase().includes(query)) {
              gridMatches = true;
              matchingGrids.push(gridConfig.label);
            }
          });
        });
      }

      if (sectionMatches || gridMatches) {
        results.push({
          ...config,
          matchingGrids: gridMatches ? matchingGrids : null,
        });
      }
    });

    return results.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [searchQuery, sectionConfigs, sections]);

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
          RPM
        </h1>
        <p
          style={{
            fontSize: '11px',
            color: '#9ca3af',
            margin: '4px 0 0',
          }}
        >
          Risk Position Management
        </p>
      </div>

      <div style={{ padding: '12px 12px 8px' }}>
        <input
          type="text"
          placeholder="Search sections & grids..."
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
          nav_groups.map((group) => {
            const groupSections = groupedSections[group.id] ?? [];
            if (groupSections.length === 0) return null;

            const isExpanded = expandedGroups[group.id] ?? false;
            const hasActiveSection = groupSections.some((s) => s.id === currentSection);

            return (
              <div key={group.id} style={{ marginBottom: '4px' }}>
                <button
                  onClick={() => toggleGroup(group.id)}
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
                    {groupSections.length}
                  </span>
                </button>

                {isExpanded &&
                  groupSections.map((section) => (
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
