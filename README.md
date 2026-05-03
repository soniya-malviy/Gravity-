# GRAVITY: GraphQL Data Completeness Visualizer

A configuration-driven web application that visualizes data completeness across GraphQL datasets using an interactive D3.js heatmap, powered by an agentic AI layer.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + D3.js
- **Backend**: Node.js + Express (Proxy & AI Routes)
- **AI Layer**: Groq API (Schema Analysis, Anomaly Detection, NL Query)
- **State**: Zustand

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment Variables**
   Create a `.env` file in the root directory (or `backend/`) with:
   ```env
   GROQ_API_KEY=your_groq_api_key
   PORT=3001
   ```
4. **Run the application**
   ```bash
   npm run dev
   ```
   This will start both the frontend (5173) and backend (3001).

## Adding a New GraphQL API
Edit `frontend/src/config/endpoints.json` and add a new entry to the `apis` array:
```json
{
  "id": "new-api",
  "name": "New API",
  "endpoint": "https://api.example.com/graphql",
  "query": "{ data { id field1 field2 } }",
  "rootKey": "data"
}
```

## Agents
- **Schema Agent**: Analyzes data samples to infer schema structure and detect changes.
- **Anomaly Agent**: Identifies sparse fields and data quality issues.
- **NL Query Agent**: Translates natural language into GraphQL filters.
- **Orchestrator**: Coordinates agents during the data lifecycle.
