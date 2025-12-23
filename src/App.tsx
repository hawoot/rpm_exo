/**
 * App.tsx - Main Application Component
 */

import { useState, useRef } from 'react';

import summarySection from '../config/sections/summary.json';
import futuresSection from '../config/sections/futures.json';
import bondsSection from '../config/sections/bonds.json';
import futuresPositionGrid from '../config/grids/futures-position.json';
import futuresPnlCard from '../config/grids/futures-pnl-card.json';
import futuresDv01Card from '../config/grids/futures-dv01-card.json';
import bondsPositionGrid from '../config/grids/bonds-position.json';

import Sidebar from './components/layout/Sidebar';
import ParamsForm from './components/forms/ParamsForm';
import DataDisplay from './components/DataDisplay';
import Metadata from './components/Metadata';

import { useData } from './hooks/useData';
import type { SectionConfig, GridConfig } from './types';

const sectionConfigs: Record<string, SectionConfig> = {
  summary: summarySection as SectionConfig,
  futures: futuresSection as SectionConfig,
  bonds: bondsSection as SectionConfig,
};

const gridConfigs: Record<string, GridConfig> = {
  'futures-position': futuresPositionGrid as GridConfig,
  'futures-pnl-card': futuresPnlCard as GridConfig,
  'futures-dv01-card': futuresDv01Card as GridConfig,
  'bonds-position': bondsPositionGrid as GridConfig,
};

function App(): JSX.Element {
  const [currentSection, setCurrentSection] = useState<string>('futures');
  const mainContentRef = useRef<HTMLElement>(null);

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
    refresh,
  } = useData();

  const section = sectionConfigs[currentSection];

  const scrollToTop = (): void => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = (): void => {
    mainContentRef.current?.scrollTo({
      top: mainContentRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleScrollButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.currentTarget.style.backgroundColor = '#3b82f6';
    e.currentTarget.style.color = '#ffffff';
  };

  const handleScrollButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.currentTarget.style.backgroundColor = '#ffffff';
    e.currentTarget.style.color = '#374151';
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        sectionConfigs={sectionConfigs}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: 1 }}>
            <ParamsForm
              params={params}
              onParamsChange={setParams}
              onSubmit={() => void refresh()}
              isLoading={isLoading}
              apiConfig={apiConfig}
              selectedEnv={selectedEnv}
              onEnvChange={setSelectedEnv}
              customUrl={customUrl}
              onCustomUrlChange={setCustomUrl}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
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
              onMouseEnter={handleScrollButtonMouseEnter}
              onMouseLeave={handleScrollButtonMouseLeave}
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
              onMouseEnter={handleScrollButtonMouseEnter}
              onMouseLeave={handleScrollButtonMouseLeave}
            >
              v
            </button>
          </div>
        </header>

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
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#1f2937',
            }}
          >
            {section?.label ?? 'Unknown Section'}
          </h2>

          {error && (
            <div
              style={{
                padding: '16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
                marginBottom: '16px',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {isLoading && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: '#6b7280',
              }}
            >
              Loading data...
            </div>
          )}

          {!isLoading &&
            apiData &&
            section?.layout?.map((row, rowIndex) => (
              <div
                key={rowIndex}
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                {row.grids.map((gridId) => {
                  const gridConfig = gridConfigs[gridId];

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
                    );
                  }

                  return (
                    <div key={gridId} style={{ flex: 1 }}>
                      <DataDisplay gridConfig={gridConfig} apiData={apiData} />
                    </div>
                  );
                })}
              </div>
            ))}

          <Metadata apiData={apiData} currentSection={currentSection} />
        </main>
      </div>
    </div>
  );
}

export default App;
