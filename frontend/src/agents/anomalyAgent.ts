import axios from 'axios';
import { useAppStore, type Anomaly } from '../store/appStore';

export interface DeepAnomalyResponse {
  anomalies: (Anomaly & { 
    type: string; 
    currentValue: number; 
    baselineValue: number; 
    rootCausHypothesis: string; 
    confidence: number; 
  })[];
  overallHealthScore: number;
  trendDirection: string;
  executiveSummary: string;
}

export const anomalyAgent = {
  async detect(records: any[], schema: string, apiId: string): Promise<DeepAnomalyResponse> {
    const store = useAppStore.getState();
    const data = store.sourceData[apiId];
    
    // Get baseline from snapshots (average of previous completeness)
    const snapshots = store.snapshots[apiId] || [];
    const baseline: Record<string, number> = {};
    if (snapshots.length > 0) {
      const fields = Object.keys(snapshots[0].fieldCompleteness);
      fields.forEach(f => {
        const sum = snapshots.reduce((acc, s) => acc + (s.fieldCompleteness[f] || 0), 0);
        baseline[f] = sum / snapshots.length;
      });
    }

    const response = await axios.post('http://localhost:3001/api/ai/analyze', {
      action: 'detect_anomalies',
      context: {
        fieldSummary: data?.fieldSummary || [],
        baseline,
        correlations: data?.correlations || [],
        schema,
        apiId
      }
    });

    return response.data;
  }
};
