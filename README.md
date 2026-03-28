# QENN Dashboard

React dashboard comparing ENN vs QENN-Qiskit vs QENN-Q# across 6 stock markets.

## Setup

### 1. Run the experiment and export JSON

```bash
python experiment.py
```

This now produces `results/results.json` in addition to the existing CSV and PKL files.

### 2. Copy the JSON into the dashboard

```bash
cp results/results.json qenn-dashboard/public/results.json
```

### 3. Install and run

```bash
cd qenn-dashboard
npm install
npm start
```

Open http://localhost:3000

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Or push to GitHub and connect the repo to vercel.app — it auto-detects Create React App.

## What's in the dashboard

- **NMSE Heatmap** — all 7 models × 6 markets, color coded green→red
- **Model toggles** — click pills to show/hide models across all charts
- **Per-market detail** — predicted vs actual price chart + loss curves + metric cards
- **Metric bar chart** — NMSE / RMSE / MAPE switchable
- **Radar chart** — score = 1/(1+NMSE), larger area = better
- **Backend equivalence** — proves Qiskit ≡ Q# for all markets
- **Full sortable results table** — click any column header to sort

