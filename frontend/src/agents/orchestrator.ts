import { useAppStore } from '../store/appStore';
import { schemaAgent } from './schemaAgent';
import { detectPIIColumns, redactPII } from '../utils/piiScanner';
import { BACKEND_URL } from '../utils/graphqlFetcher';
import axios from 'axios';

export const orchestrator = {
  async onDataLoad(apiId: string, records: any[]) {
    const store = useAppStore.getState();
    const data = store.sourceData[apiId];
    if (!data) return;

    store.setApiLoading('anomaly', true);
    
    try {
      // 1. PII Scanning
      const headers = Object.keys(records[0] || {});
      const piiCols = detectPIIColumns(headers);
      const safeRecords = redactPII(records.slice(0, 3), piiCols);

      // 2. Schema Analysis
      let schemaInfo = "";
      if (data.source === 'csv') {
        const schemaRes = await axios.post(`${BACKEND_URL}/ai/analyze`, {
          action: 'csv_schema',
          context: {
            fieldSummary: data.fieldSummary,
            sampleRows: safeRecords
          }
        });
        schemaInfo = `CSV DOMAIN: ${schemaRes.data.domain}. Modeling: ${schemaRes.data.modelingSuggestions?.join(', ')}`;
      } else {
        schemaInfo = await schemaAgent.analyze(records);
      }
      store.setSchemaInfo(schemaInfo);
      
      // 3. Deep Anomaly Detection
      const anomalyRes = await axios.post(`${BACKEND_URL}/ai/analyze`, {
        action: data.source === 'csv' ? 'csv_anomaly' : 'detect_anomalies',
        context: {
          source: data.source,
          fieldSummary: data.fieldSummary,
          correlations: data.correlations,
          sampleRows: safeRecords,
          schema: schemaInfo
        }
      });
      
      const labeledAnomalies = anomalyRes.data.anomalies.map((a: any) => ({
        ...a,
        field: `[${data.source.toUpperCase()}] ${a.field}`
      }));
      
      store.setAnomalies([...labeledAnomalies]);
      store.setHealthScore(anomalyRes.data.overallHealthScore || 100);

    } catch (err) {
      console.error('Orchestrator error:', err);
      store.setError(`AI analysis failed for ${apiId}`);
    } finally {
      store.setApiLoading('anomaly', false);
    }
  }
};
