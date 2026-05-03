import axios from 'axios';
import { BACKEND_URL } from '../utils/graphqlFetcher';

export const schemaAgent = {
  async analyze(records: any[]) {
    try {
      const response = await axios.post(`${BACKEND_URL}/ai/analyze`, {
        action: 'detect_anomalies', // Re-using detect_anomalies for basic schema if needed
        context: {
          fieldSummary: [], // Orchestrator will pass better context
          sampleRows: records.slice(0, 5)
        }
      });
      return response.data.executiveSummary || "Schema analysis completed.";
    } catch (err) {
      console.error("Schema Agent Error:", err);
      return "Schema analysis failed.";
    }
  }
};
