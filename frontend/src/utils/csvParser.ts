import Papa from 'papaparse';
import { type DensityMatrix, type DensityCell } from './densityEngine';

export type ColumnType = 'string' | 'number' | 'date' | 'boolean' | 'category' | 'id';

export interface ParseResult {
  headers: string[];
  rows: Record<string, any>[];
  rowCount: number;
  columnCount: number;
  parseErrors: any[];
  detectedTypes: Record<string, ColumnType>;
}

const NULL_STRINGS = new Set([
  'null', 'NULL', 'N/A', 'n/a', 'NA', 'na', 'none', 'None', 'NONE',
  '-', '--', 'NaN', 'nan', '#N/A', '?', 'unknown', 'Unknown', ''
]);

export const detectNullValues = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    return NULL_STRINGS.has(value.trim());
  }
  if (typeof value === 'number') {
    return isNaN(value);
  }
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
};

export const detectColumnTypes = (rows: any[], headers: string[]): Record<string, ColumnType> => {
  const types: Record<string, ColumnType> = {};
  const sampleSize = Math.min(rows.length, 50);
  const sampleRows = rows.slice(0, sampleSize);

  headers.forEach(header => {
    const values = sampleRows.map(r => r[header]).filter(v => !detectNullValues(v));
    if (values.length === 0) {
      types[header] = 'string';
      return;
    }

    // Check for ID (High cardinality or unique)
    const uniqueValues = new Set(rows.map(r => r[header]));
    if (uniqueValues.size === rows.length) {
      types[header] = 'id';
      return;
    }

    // Check for Boolean
    const isBoolean = values.every(v => {
      const s = String(v).toLowerCase();
      return ['true', 'false', 'yes', 'no', '1', '0'].includes(s);
    });
    if (isBoolean) {
      types[header] = 'boolean';
      return;
    }

    // Check for Number
    const isNumber = values.every(v => !isNaN(Number(v)));
    if (isNumber) {
      types[header] = 'number';
      return;
    }

    // Check for Date
    const isDate = values.every(v => !isNaN(Date.parse(String(v))));
    if (isDate) {
      types[header] = 'date';
      return;
    }

    // Check for Category
    if (uniqueValues.size < rows.length * 0.2 || uniqueValues.size < 20) {
      types[header] = 'category';
      return;
    }

    types[header] = 'string';
  });

  return types;
};

export const parseCSV = (file: File, options: any = {}): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      ...options,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, any>[];
        const detectedTypes = detectColumnTypes(rows, headers);

        resolve({
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
          parseErrors: results.errors,
          detectedTypes
        });
      },
      error: (err) => reject(err)
    });
  });
};

export const normalizeCSVToMatrix = (rows: any[], headers: string[], idColumn?: string): DensityMatrix => {
  const fieldNames = headers;
  const rowIds = rows.map((r, i) => idColumn ? r[idColumn] : `row_${i}`);

  const matrixRows: DensityCell[][] = rows.map((row) => {
    return fieldNames.map((field) => {
      const val = row[field];
      const isComp = !detectNullValues(val);
      return {
        value: isComp ? 1 : 0,
        isComplete: isComp,
        completeness: isComp ? 100 : 0,
        type: typeof val,
        cluster: 0,
        isAnomaly: false,
        originalValue: val,
      };
    });
  });

  return {
    rows: matrixRows,
    fieldNames,
    rowIds
  };
};
