/**
 * Table Component - AG Grid wrapper
 */

import { useMemo, useCallback, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { convertColumnsToColDefs } from '../lib/agGridUtils';
import type { TableProps } from '../types';

// Register AG Grid modules (required for v31+)
ModuleRegistry.registerModules([AllCommunityModule]);

function Table({ data, columns, totals, label, fontSize = 12 }: TableProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const columnDefs = useMemo(() => convertColumnsToColDefs(columns), [columns]);

  const theme = useMemo(() => themeQuartz.withParams({
    backgroundColor: '#f8f9fa',
    headerBackgroundColor: '#f1f3f4',
    rowHoverColor: '#e8eaed',
    columnHoverColor: '#e8eaed',
    fontSize,
  }), [fontSize]);

  const pinnedBottomRowData = useMemo(() => {
    if (!totals) return undefined;
    const firstField = columns[0]?.field ?? '';
    return [{ ...totals, [firstField]: 'Total' }];
  }, [totals, columns]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    minWidth: 50,
  }), []);

  const copyToClipboard = useCallback(() => {
    const headers = columns.map(c => c.label).join('\t');
    const rows = (data ?? []).map(row =>
      columns.map(c => row[c.field] ?? '').join('\t')
    ).join('\n');

    let text = headers + '\n' + rows;
    if (totals) {
      const totalsRow = columns.map((c, i) =>
        i === 0 ? 'Total' : (totals[c.field] ?? '')
      ).join('\t');
      text += '\n' + totalsRow;
    }

    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [data, columns, totals]);

  if (!data?.length) {
    return (
      <div style={{ padding: '16px', color: '#9ca3af' }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        {label && (
          <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: '#374151' }}>
            {label}
          </h3>
        )}
        <button
          onClick={copyToClipboard}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: copied ? '#10b981' : '#374151',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '60px',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div style={{ width: '100%' }}>
        <AgGridReact
          theme={theme}
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pinnedBottomRowData={pinnedBottomRowData}
          domLayout="autoHeight"
          autoSizeStrategy={{ type: 'fitCellContents' }}
          columnHoverHighlight={true}
        />
      </div>
    </div>
  );
}

export default Table;
