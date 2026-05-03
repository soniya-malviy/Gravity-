const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/proxy', async (req, res) => {
  const { endpoint, query, variables, headers } = req.body;

  if (!endpoint || !query) {
    return res.status(400).json({ error: 'Endpoint and query are required' });
  }

  try {
    const response = await axios({
      method: 'post',
      url: endpoint,
      data: {
        query,
        variables,
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GravityDataObservability/1.0',
        ...headers,
      },
      timeout: 10000,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.message);

    // Simple retry logic (1 retry for network errors)
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      try {
        const retryResponse = await axios({
          url: endpoint,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'GravityDataObservability/1.0',
            ...headers,
          },
          data: {
            query,
            variables,
          },
          timeout: 15000,
        });
        return res.json(retryResponse.data);
      } catch (retryError) {
        return res.status(502).json({ error: 'Gateway Error after retry', details: retryError.message });
      }
    }

    const status = error.response ? error.response.status : 500;
    const data = error.response ? error.response.data : { error: error.message };
    console.error(`Proxy Target Error [${status}]:`, JSON.stringify(data, null, 2));
    res.status(status).json(data);
  }
});

module.exports = router;
