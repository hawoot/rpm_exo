/**
 * Table Component - AG Grid wrapper
 */

import { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { convertColumnsToColDefs } from '../lib/agGridUtils';
import type { TableProps } from '../types';

// Register AG Grid modules (required for v31+)
ModuleRegistry.registerModules([AllCommunityModule]);

function Table({ data, columns, totals, label }: TableProps): JSX.Element {
  const columnDefs = useMemo(() => convertColumnsToColDefs(columns), [columns]);

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
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            color: '#6b7280',
            cursor: 'pointer',
          }}
        >
          Copy
        </button>
      </div>

      <div className="ag-theme-alpine" style={{ width: '100%' }}>
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pinnedBottomRowData={pinnedBottomRowData}
          domLayout="autoHeight"
          autoSizeStrategy={{ type: 'fitCellContents' }}
        />
      </div>
    </div>
  );
}

export default Table;
