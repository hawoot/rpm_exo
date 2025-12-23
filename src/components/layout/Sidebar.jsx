/**
 * Sidebar Component - Navigation for sections
 *
 * Features:
 * - Search bar to filter sections
 * - Collapsible nav groups (collapsed by default)
 * - Active section highlighting
 */

import { useState, useMemo } from 'react'
import sectionsIndex from '../../../config/sections/_index.json'

function Sidebar({ currentSection, onSectionChange, sectionConfigs }) {
  const { nav_groups, sections } = sectionsIndex

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Track which groups are expanded (collapsed by default)
  const [expandedGroups, setExpandedGroups] = useState({})

  // Toggle group expansion
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  // Group sections by their nav_group
  const groupedSections = useMemo(() => {
    const grouped = {}
    nav_groups.forEach(group => {
      grouped[group.id] = []
    })

    sections.forEach(sectionId => {
      const config = sectionConfigs[sectionId]
      if (config && config.nav_group && grouped[config.nav_group]) {
        grouped[config.nav_group].push(config)
      }
    })

    // Sort sections within each group by order
    Object.keys(grouped).forEach(groupId => {
      grouped[groupId].sort((a, b) => (a.order || 0) - (b.order || 0))
    })

    return grouped
  }, [sectionConfigs, nav_groups, sections])

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return null

    const query = searchQuery.toLowerCase()
    const results = []

    sections.forEach(sectionId => {
      const config = sectionConfigs[sectionId]
      if (config && config.label.toLowerCase().includes(query)) {
        results.push(config)
      }
    })

    return results.sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [searchQuery, sectionConfigs, sections])

  // When searching, show flat list; otherwise show grouped
  const isSearching = searchQuery.trim().length > 0

  return (
    <nav style={{
      width: '220px',
      backgroundColor: '#1f2937',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Logo/Title */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #374151',
      }}>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 700,
          margin: 0,
        }}>
          RPM
        </h1>
        <p style={{
          fontSize: '11px',
          color: '#9ca3af',
          margin: '4px 0 0',
        }}>
          Risk Position Management
        </p>
      </div>

      {/* Search bar */}
      <div style={{ padding: '12px 12px 8px' }}>
        <input
          type="text"
          placeholder="Search sections..."
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

      {/* Scrollable nav area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0',
      }}>
        {isSearching ? (
          // Search results (flat list)
          <div>
            {filteredSections && filteredSections.length > 0 ? (
              filteredSections.map(section => (
                <SectionButton
                  key={section.id}
                  section={section}
                  isActive={currentSection === section.id}
                  onClick={() => {
                    onSectionChange(section.id)
                    setSearchQuery('')
                  }}
                />
              ))
            ) : (
              <div style={{
                padding: '16px',
                color: '#9ca3af',
                fontSize: '12px',
                textAlign: 'center',
              }}>
                No sections found
              </div>
            )}
          </div>
        ) : (
          // Grouped navigation
          nav_groups.map(group => {
            const groupSections = groupedSections[group.id] || []
            if (groupSections.length === 0) return null

            const isExpanded = expandedGroups[group.id] || false
            const hasActiveSection = groupSections.some(s => s.id === currentSection)

            return (
              <div key={group.id} style={{ marginBottom: '4px' }}>
                {/* Group header */}
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
                  <span style={{
                    fontSize: '8px',
                    transition: 'transform 0.15s',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}>
                    ▶
                  </span>
                  {group.label}
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '10px',
                    color: '#6b7280',
                  }}>
                    {groupSections.length}
                  </span>
                </button>

                {/* Sections (shown when expanded) */}
                {isExpanded && groupSections.map(section => (
                  <SectionButton
                    key={section.id}
                    section={section}
                    isActive={currentSection === section.id}
                    onClick={() => onSectionChange(section.id)}
                    indent
                  />
                ))}
              </div>
            )
          })
        )}
      </div>
    </nav>
  )
}

// Section button component
function SectionButton({ section, isActive, onClick, indent = false }) {
  const [isHovered, setIsHovered] = useState(false)

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
      {section.label}
    </button>
  )
}

export default Sidebar
