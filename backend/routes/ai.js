const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

let groqClient = null;

const getGroqClient = () => {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

router.post('/analyze', async (req, res) => {
  const { action, context } = req.body;
  const client = getGroqClient();

  if (!client) {
    return res.status(503).json({ 
      error: 'AI service unavailable', 
      details: 'GROQ_API_KEY is missing in backend configuration.' 
    });
  }

  try {
    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'detect_anomalies' || action === 'csv_anomaly') {
      systemPrompt = `You are the Deep Anomaly Agent for GRAVITY.
Analyze field completeness, baselines, and patterns. Respond with valid JSON only:
{
  "anomalies": [{
    "field": "string",
    "severity": "critical"|"warning"|"info",
    "type": "sudden_drop"|"systematic_null"|"co_null_pattern"|"schema_drift"|"outlier",
    "message": "string",
    "suggestion": "string"
  }],
  "overallHealthScore": number,
  "executiveSummary": "string"
}`;
      userPrompt = `CONTEXT (Respond in JSON):
- Source: ${context.source || 'graphql'}
- Field Stats: ${JSON.stringify(context.fieldSummary)}
- Correlations: ${JSON.stringify(context.correlations || [])}
- Sample Records: ${JSON.stringify(context.sampleRows || [])}
Analyze and detect anomalies.`;

    } else if (action === 'csv_schema') {
      systemPrompt = `You are the GRAVITY Schema Agent. Analyze CSV structure and domain.
Respond with JSON:
{
  "domain": "string",
  "columnInsights": [{ "field": "string", "role": "id"|"measure"|"dimension"|"metadata", "importance": "high"|"medium"|"low", "insight": "string" }],
  "modelingSuggestions": ["string"]
}`;
      userPrompt = `CSV FIELDS: ${JSON.stringify(context.fieldSummary)}\nSAMPLE: ${JSON.stringify(context.sampleRows)}\nOutput must be valid JSON.`;

    } else if (action === 'nl_query') {
      systemPrompt = `You are the GRAVITY Query Agent. Convert NL questions into data filters.
Respond with JSON: { "filters": { "fields": [], "minCompleteness": number, "recordFilter": "string" }, "explanation": "string" }`;
      userPrompt = `QUERY: ${context.query}\nFIELDS: ${JSON.stringify(context.fields || [])}\nOutput as JSON object.`;

    } else if (action === 'chat') {
       systemPrompt = `You are GRAVITY, an advanced AI data observability assistant. 
       Be technical, precise, and helpful. Current data source is ${context.source || 'API'}.
       If asked to filter, include an "action" field in your JSON response. Respond with JSON.`;
       userPrompt = `MESSAGE: ${context.message}\nCONTEXT: ${JSON.stringify(context.fieldSummary || [])}`;
    }

    const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    let completion = null;
    let lastErr = null;

    for (const model of models) {
      try {
        completion = await client.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model,
          response_format: { type: 'json_object' }
        });
        if (completion) break;
      } catch (err) {
        lastErr = err;
        if (err.status === 429) {
          console.warn(`Model ${model} rate limited, trying fallback...`);
          continue;
        }
        throw err;
      }
    }

    if (!completion) throw lastErr;

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (err) {
    console.error('Groq AI Error:', err);
    res.status(500).json({ error: 'AI analysis failed', details: err.message });
  }
});

module.exports = router;
