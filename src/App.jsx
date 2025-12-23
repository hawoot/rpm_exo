/**
 * App.jsx - Main Application Component
 *
 * Layout:
 * - Sidebar (left): Navigation between sections
 * - Content (right): Header with params form + section content
 */

import { useState, useRef } from 'react'

// Import section and grid configs
import summarySection from '../config/sections/summary.json'
import futuresSection from '../config/sections/futures.json'
import bondsSection from '../config/sections/bonds.json'
import futuresPositionGrid from '../config/grids/futures-position.json'
import futuresPnlCard from '../config/grids/futures-pnl-card.json'
import futuresDv01Card from '../config/grids/futures-dv01-card.json'
import bondsPositionGrid from '../config/grids/bonds-position.json'

// Import components
import Sidebar from './components/layout/Sidebar'
import ParamsForm from './components/forms/ParamsForm'
import DataDisplay from './components/DataDisplay'
import Metadata from './components/Metadata'

// Import data hook
import { useData } from './hooks/useData'

// Config lookups
const sectionConfigs = {
  'summary': summarySection,
  'futures': futuresSection,
  'bonds': bondsSection,
}

const gridConfigs = {
  'futures-position': futuresPositionGrid,
  'futures-pnl-card': futuresPnlCard,
  'futures-dv01-card': futuresDv01Card,
  'bonds-position': bondsPositionGrid,
}

function App() {
  // Current section state
  const [currentSection, setCurrentSection] = useState('futures')

  // Ref for main content area (for scroll buttons)
  const mainContentRef = useRef(null)

  // Data hook
  const {
    data: apiData,
    isLoading,
    error,
    params,
    setParams,
    apiConfig,
    selectedEnv,
    setSelectedEnv,
    customUrl,
    setCustomUrl,
    effectiveBaseUrl,
    refresh,
  } = useData()

  // Get current section config
  const section = sectionConfigs[currentSection]

  // Scroll functions
  const scrollToTop = () => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    mainContentRef.current?.scrollTo({
      top: mainContentRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        sectionConfigs={sectionConfigs}
      />

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header with form */}
        <header style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1 }}>
            <ParamsForm
              params={params}
              onParamsChange={setParams}
              onSubmit={refresh}
              isLoading={isLoading}
              apiConfig={apiConfig}
              selectedEnv={selectedEnv}
              onEnvChange={setSelectedEnv}
              customUrl={customUrl}
              onCustomUrlChange={setCustomUrl}
            />
          </div>

          {/* Scroll buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}>
            <button
              onClick={scrollToTop}
              title="Scroll to top"
              style={{
                width: '24px',
                height: '16px',
                borderRadius: '3px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: '#374151',
                fontSize: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.color = '#374151'
              }}
            >
              ^
            </button>

            <button
              onClick={scrollToBottom}
              title="Scroll to bottom"
              style={{
                width: '24px',
                height: '16px',
                borderRadius: '3px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: '#374151',
                fontSize: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.color = '#374151'
              }}
            >
              v
            </button>
          </div>
        </header>

        {/* Content area */}
        <main
          ref={mainContentRef}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            backgroundColor: '#f9fafb',
            position: 'relative',
          }}
        >
          {/* Section title */}
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '16px',
            color: '#1f2937',
          }}>
            {section?.label || 'Unknown Section'}
          </h2>

          {/* Error state */}
          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626',
              marginBottom: '16px',
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              Loading data...
            </div>
          )}

          {/* Section layout */}
          {!isLoading && apiData && section?.layout?.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              {row.grids.map((gridId) => {
                const gridConfig = gridConfigs[gridId]

                if (!gridConfig) {
                  return (
                    <div
                      key={gridId}
                      style={{
                        flex: 1,
                        padding: '16px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#dc2626',
                      }}
                    >
                      Grid config not found: {gridId}
                    </div>
                  )
                }

                return (
                  <div key={gridId} style={{ flex: 1 }}>
                    <DataDisplay gridConfig={gridConfig} apiData={apiData} />
                  </div>
                )
              })}
            </div>
          ))}

          {/* Metadata section (collapsed by default) */}
          <Metadata apiData={apiData} currentSection={currentSection} />
        </main>
      </div>
    </div>
  )
}

export default App
