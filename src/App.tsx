/**
 * App.tsx - Main Application Component
 */

import { useState, useRef } from 'react';

import Sidebar from './components/layout/Sidebar';
import ParamsForm from './components/forms/ParamsForm';
import DataDisplay from './components/DataDisplay';
import RequestInfo from './components/RequestInfo';
import ErrorDisplay from './components/ErrorDisplay';

import { useData } from './hooks/useData';
import { getSection, getDefaultSectionId, componentConfigs } from './config/registry';
import type { LayoutItem } from './types';

function App(): JSX.Element {
  const [currentSection, setCurrentSection] = useState<string>(getDefaultSectionId);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
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

  const section = getSection(currentSection);

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
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
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
            <div style={{ marginBottom: '16px' }}>
              <ErrorDisplay
                title="Fetch Error"
                errorStack={error}
              />
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
            section &&
            (() => {
              // Group layout items by row
              const rowGroups: Record<number, LayoutItem[]> = {};
              section.layout?.forEach((item) => {
                const rowItems = rowGroups[item.row] ?? (rowGroups[item.row] = []);
                rowItems.push(item);
              });

              // Sort rows and render
              return Object.keys(rowGroups)
                .map(Number)
                .sort((a, b) => a - b)
                .map((rowNum) => {
                  const items = rowGroups[rowNum]?.sort((a, b) => a.col - b.col) ?? [];
                  return (
                    <div
                      key={rowNum}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '16px',
                      }}
                    >
                      {items.map((item) => {
                        const componentConfig = componentConfigs[item.component];

                        if (!componentConfig) {
                          return (
                            <div
                              key={item.component}
                              style={{
                                flex: 1,
                                padding: '16px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                color: '#dc2626',
                              }}
                            >
                              Component config not found: {item.component}
                            </div>
                          );
                        }

                        return (
                          <div key={item.component} style={{ flex: 1 }}>
                            <DataDisplay componentConfig={componentConfig} apiData={apiData} />
                          </div>
                        );
                      })}
                    </div>
                  );
                });
            })()}

          <RequestInfo apiData={apiData} />
        </main>
      </div>
    </div>
  );
}

export default App;
