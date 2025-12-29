/**
 * ParamsForm - Collapsible form for API request parameters
 */

import { useState, useRef, useEffect } from 'react';
import type { ParamsFormProps, TimeOfDay, EnvironmentConfig } from '../../types';

const AVAILABLE_BOOKS: string[] = [
  'OfficialCUPSBook',
  'EXOTICS',
  'RATES_EUR',
  'RATES_USD',
  'RATES_GBP',
  'FX_SPOT',
  'FX_OPTIONS',
];

const BOOK_GROUPS: Record<string, string[]> = {
  Main: ['OfficialCUPSBook', 'RATES_EUR', 'RATES_USD', 'RATES_GBP'],
  MGMT: ['OfficialCUPSBook'],
  Rates: ['RATES_EUR', 'RATES_USD', 'RATES_GBP'],
  FX: ['FX_SPOT', 'FX_OPTIONS'],
  All: AVAILABLE_BOOKS,
};

const TIME_OF_DAY_OPTIONS: TimeOfDay[] = ['Live', 'Close', 'Open'];

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

function ParamsForm({
  params,
  onParamsChange,
  onSubmit,
  isLoading,
  apiConfig,
  selectedEnv,
  onEnvChange,
  customUrl,
  onCustomUrlChange,
}: ParamsFormProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 });
  const bookButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isBookDropdownOpen && bookButtonRef.current) {
      const rect = bookButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isBookDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        isBookDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        bookButtonRef.current &&
        !bookButtonRef.current.contains(event.target as Node)
      ) {
        setIsBookDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBookDropdownOpen]);

  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr || dateStr.length !== 8) return '';
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  };

  const parseDateFromInput = (dateStr: string): string => {
    return dateStr.replace(/-/g, '');
  };

  const handleDateChange = (field: 'env_date' | 'pos_date', value: string): void => {
    onParamsChange({
      ...params,
      [field]: parseDateFromInput(value),
    });
  };

  const handleTimeOfDayChange = (value: string): void => {
    onParamsChange({
      ...params,
      time_of_day: value as TimeOfDay,
    });
  };

  const handleBypassCacheChange = (checked: boolean): void => {
    onParamsChange({
      ...params,
      bypass_cache: checked,
    });
  };

  const handleBookToggle = (book: string): void => {
    const currentBooks = params.books ?? [];
    const newBooks = currentBooks.includes(book)
      ? currentBooks.filter((b) => b !== book)
      : [...currentBooks, book];
    onParamsChange({
      ...params,
      books: newBooks,
    });
  };

  const handleGroupSelect = (groupName: string): void => {
    const groupBooks = BOOK_GROUPS[groupName] ?? [];
    onParamsChange({
      ...params,
      books: [...groupBooks],
    });
  };

  const handleClearBooks = (): void => {
    onParamsChange({
      ...params,
      books: [],
    });
  };

  const effectiveUrl = customUrl || apiConfig.environments[selectedEnv]?.base_url;

  if (isCollapsed) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#374151',
          }}
        >
          <span style={{ fontSize: '10px' }}>▶</span>
          <span style={{ color: '#6b7280' }}>Params:</span>
          <span>{params.env_date}</span>
          <span style={{ color: '#9ca3af' }}>|</span>
          <span>{params.time_of_day}</span>
          <span style={{ color: '#9ca3af' }}>|</span>
          <span>{params.books?.length ?? 0} books</span>
          {params.bypass_cache && (
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                borderRadius: '4px',
              }}
            >
              No Cache
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            onSubmit();
            setIsCollapsed(true);
          }}
          disabled={isLoading}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Loading...' : 'Fetch'}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>REQUEST PARAMETERS</span>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            padding: '4px 8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          ▲ Collapse
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <label style={{ fontSize: '12px', color: '#6b7280', minWidth: '70px' }}>Environment</label>
          <select
            value={selectedEnv}
            onChange={(e) => onEnvChange(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          >
            {Object.entries(apiConfig.environments).map(([key, env]) => (
              <option key={key} value={key}>
                {(env as EnvironmentConfig).label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={customUrl || effectiveUrl}
            onChange={(e) => onCustomUrlChange(e.target.value)}
            placeholder="API Base URL"
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              fontFamily: 'monospace',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280' }}>Env Date</label>
            <input
              type="date"
              value={formatDateForInput(params.env_date)}
              onChange={(e) => handleDateChange('env_date', e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280' }}>Pos Date</label>
            <input
              type="date"
              value={formatDateForInput(params.pos_date)}
              onChange={(e) => handleDateChange('pos_date', e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280' }}>Time of Day</label>
            <select
              value={params.time_of_day}
              onChange={(e) => handleTimeOfDayChange(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                minWidth: '90px',
              }}
            >
              {TIME_OF_DAY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280' }}>Books</label>
            <button
              ref={bookButtonRef}
              type="button"
              onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                minWidth: '160px',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{params.books?.length ? `${params.books.length} selected` : 'Select...'}</span>
              <span>▾</span>
            </button>

            {isBookDropdownOpen && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'fixed',
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: Math.max(dropdownPosition.width, 220),
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  maxHeight: '320px',
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                  }}
                >
                  <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Quick Select
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {Object.keys(BOOK_GROUPS).map((groupName) => (
                      <button
                        key={groupName}
                        type="button"
                        onClick={() => handleGroupSelect(groupName)}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          border: '1px solid #d1d5db',
                          borderRadius: '3px',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          color: '#374151',
                        }}
                      >
                        {groupName}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleClearBooks}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        border: '1px solid #fecaca',
                        borderRadius: '3px',
                        backgroundColor: '#fef2f2',
                        cursor: 'pointer',
                        color: '#dc2626',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {AVAILABLE_BOOKS.map((book) => (
                  <label
                    key={book}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      backgroundColor: params.books?.includes(book) ? '#eff6ff' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={params.books?.includes(book) ?? false}
                      onChange={() => handleBookToggle(book)}
                    />
                    {book}
                  </label>
                ))}
              </div>
            )}
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              padding: '6px 0',
            }}
          >
            <input
              type="checkbox"
              checked={params.bypass_cache ?? false}
              onChange={(e) => handleBypassCacheChange(e.target.checked)}
            />
            <span style={{ color: '#6b7280' }}>Bypass Cache</span>
          </label>

          <button
            type="button"
            onClick={() => {
              onSubmit();
              setIsCollapsed(true);
            }}
            disabled={isLoading}
            style={{
              padding: '8px 24px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginLeft: 'auto',
            }}
          >
            {isLoading ? 'Loading...' : 'Fetch Data'}
          </button>
        </div>

        {params.books && params.books.length > 0 && (
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            {params.books.map((book) => (
              <span
                key={book}
                style={{
                  padding: '2px 8px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {book}
                <button
                  type="button"
                  onClick={() => handleBookToggle(book)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '0 2px',
                    color: '#6b7280',
                    fontSize: '14px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ParamsForm;
