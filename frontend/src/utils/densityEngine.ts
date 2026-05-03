export interface DensityCell {
  value: 0 | 1;
  isComplete: boolean;
  completeness: number;
  type: string;
  cluster: number;
  isAnomaly: boolean;
  originalValue: any;
}

export interface DensityMatrix {
  rows: DensityCell[][];
  fieldNames: string[];
  rowIds: (string | number)[];
  clusters?: number[];
}

export interface FieldSummary {
  fieldName: string;
  completeness: number;
  nullCount: number;
  presentCount: number;
  type: string;
}

/**
 * Deep recursive flattening of objects and arrays.
 */
const flattenObject = (obj: any, prefix = '', seen = new WeakSet()): Record<string, any> => {
  const flattened: Record<string, any> = {};

  if (!obj || typeof obj !== 'object' || seen.has(obj)) {
    return { [prefix.slice(0, -1)]: obj };
  }

  if (typeof obj === 'object') seen.add(obj);

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix + key;

    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          flattened[newKey] = null;
        } else if (typeof value[0] === 'object') {
          flattened[`${newKey}_count`] = value.length;
          Object.assign(flattened, flattenObject(value[0], newKey + '_', seen));
        } else {
          flattened[newKey] = value.join(', ');
        }
      } else {
        Object.assign(flattened, flattenObject(value, newKey + '_', seen));
      }
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
};

const isEmpty = (val: any): boolean => {
  return val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0);
};

export const computeDensityMatrix = (records: any[]): DensityMatrix => {
  if (!records || records.length === 0) {
    return { rows: [], fieldNames: [], rowIds: [] };
  }

  const flattenedRecords = records.map((r) => flattenObject(r));
  const fieldNames = Array.from(new Set(flattenedRecords.flatMap((r) => Object.keys(r))))
    .filter(name => !name.endsWith('_count'))
    .sort();
  
  const rowIds = records.map((r, i) => r.id || r.code || r.mission_name || r.name || `idx_${i}`);

  const rows: DensityCell[][] = flattenedRecords.map((record) => {
    return fieldNames.map((field) => {
      const val = record[field];
      const isComp = !isEmpty(val);
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

  return { rows, fieldNames, rowIds };
};

export const clusterRecords = (matrix: DensityMatrix) => {
  if (matrix.rows.length < 3) return matrix;

  const k = 3;
  const data = matrix.rows.map(row => row.map(cell => cell.value));
  let centroids = [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]];

  const getDistance = (v1: number[], v2: number[]) => {
    return Math.sqrt(v1.reduce((acc, val, i) => acc + Math.pow(val - v2[i], 2), 0));
  };

  let clusters: number[][] = [];
  for (let iter = 0; iter < 5; iter++) {
    clusters = Array.from({ length: k }, () => []);
    data.forEach((point, i) => {
      const distances = centroids.map(c => getDistance(point, c));
      const closestIndex = distances.indexOf(Math.min(...distances));
      clusters[closestIndex].push(i);
    });

    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return Array(data[0].length).fill(0);
      return data[0].map((_, i) => cluster.reduce((acc, idx) => acc + data[idx][i], 0) / cluster.length);
    });
  }

  const rowsWithClusters = matrix.rows.map((row, i) => {
    const distances = centroids.map(c => getDistance(data[i], c));
    const cluster = distances.indexOf(Math.min(...distances));
    // Update each cell in the row with the cluster index
    row.forEach(cell => cell.cluster = cluster);
    return { row, id: matrix.rowIds[i], cluster };
  });

  rowsWithClusters.sort((a, b) => a.cluster - b.cluster);

  return {
    ...matrix,
    rows: rowsWithClusters.map(r => r.row),
    rowIds: rowsWithClusters.map(r => r.id),
    clusters: rowsWithClusters.map(r => r.cluster)
  };
};

export const computeFieldCorrelation = (matrix: DensityMatrix) => {
  const { rows, fieldNames } = matrix;
  if (fieldNames.length === 0) return [];

  const correlationMatrix: { fieldA: string, fieldB: string, correlation: number }[] = [];

  for (let i = 0; i < fieldNames.length; i++) {
    for (let j = i + 1; j < fieldNames.length; j++) {
      let bothNull = 0;
      let totalNull = 0;

      rows.forEach(row => {
        const isNullA = row[i].value === 0;
        const isNullB = row[j].value === 0;
        if (isNullA || isNullB) {
          totalNull++;
          if (isNullA && isNullB) bothNull++;
        }
      });

      const correlation = totalNull > 0 ? bothNull / totalNull : 0;
      if (correlation > 0.5) {
        correlationMatrix.push({ fieldA: fieldNames[i], fieldB: fieldNames[j], correlation });
      }
    }
  }

  return correlationMatrix.sort((a, b) => b.correlation - a.correlation);
};

export const computeFieldSummary = (records: any[]): FieldSummary[] => {
  if (!records || records.length === 0) return [];
  const matrix = computeDensityMatrix(records);
  const { rows, fieldNames } = matrix;

  return fieldNames.map((field, colIndex) => {
    let presentCount = 0;
    rows.forEach((row) => {
      if (row[colIndex].value === 1) presentCount++;
    });
    const total = records.length;
    return {
      fieldName: field,
      completeness: (presentCount / total) * 100,
      nullCount: total - presentCount,
      presentCount,
      type: rows[0][colIndex].type
    };
  });
};
