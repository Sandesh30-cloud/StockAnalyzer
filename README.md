# StockAnalyzer

StockAnalyzer is a mini AI market research assistant built with a FastAPI backend and a Next.js dashboard. It fetches live stock data, pulls recent Yahoo Finance news, runs from-scratch sentiment analysis in Python, applies moving-average trend logic, generates Buy/Sell/Hold signals, and explains the decision in plain language.

## What It Does

- Fetches stock market data for 1 to 5 symbols
- Fetches latest Yahoo Finance news for each stock
- Performs Python-based sentiment scoring on headlines and summaries
- Performs trend analysis using:
  - 1-month price change
  - 3-month price change
  - volume trend
  - SMA20 / SMA50 moving averages
- Generates:
  - Buy / Sell / Hold style views
  - recommendation signals
  - explanation text for the decision
- Supports:
  - multi-stock comparison
  - financial statement viewing
  - holders analysis
  - price charts
  - backtesting of an improved trend-following strategy
  - CLI, API, and React dashboard access

## Approach

The project is split into two parts:

### Backend

The FastAPI backend is responsible for:

- fetching stock and news data from `yfinance`
- normalizing raw Yahoo Finance values
- computing financial ratios like ROE and debt-to-equity
- computing 52-week metrics from historical OHLC data instead of summary fields
- running from-scratch sentiment analysis using a finance keyword lexicon in Python
- computing trend metrics and moving-average signals
- generating recommendation payloads
- generating a local AI-style reasoning summary
- running a backtest with moving averages, momentum filtering, and risk controls

### Frontend

The Next.js frontend is responsible for:

- searching and selecting stocks
- comparing multiple stocks visually
- rendering financial tables, charts, holders, news, insights, and backtesting
- polling selected API routes every 60 seconds to keep the dashboard fresh

## AI / Analysis Logic

This project does not use OpenAI or any external LLM API.

Instead, the "AI" part is implemented from scratch in Python:

1. News sentiment:
   - positive and negative finance terms are matched against article text
   - each article is classified as `Positive`, `Neutral`, or `Negative`
2. Trend analysis:
   - 1M change
   - 3M change
   - volume trend
   - `SMA20`
   - `SMA50`
   - moving-average signal:
     - bullish when `price > SMA20 > SMA50`
     - bearish when `price < SMA20 < SMA50`
3. Decision logic:
   - recommendation scoring uses valuation, ROE, debt, dividend, momentum, moving averages, and news sentiment
4. Explanation:
   - the backend assembles a reasoning summary from the strongest bullish and bearish drivers

## Backtesting

The project includes a Python backtesting engine for a trend-following strategy built on:

- `SMA20`
- `SMA50`
- `RSI14`
- `1:3` risk-reward management

Strategy logic:

- enter long when `price > SMA20 > SMA50` and `RSI14` is between `50` and `70`
- exit when price closes below `SMA20`
- exit when `RSI14 < 45`
- use an `8%` trailing stop and a `24%` take-profit target to maintain a `1:3` risk-reward setup

It returns:

- strategy return
- buy-and-hold return
- max drawdown
- win rate
- trade count
- exposure
- average trade return
- best trade
- worst trade
- recent trades

## Assumptions

- Yahoo Finance data accessed through `yfinance` is available at runtime
- some Yahoo summary fields may be missing or inconsistent, so the backend prefers stronger sources like statements and OHLC history where possible
- news availability depends on what Yahoo Finance exposes for a symbol
- this project is for research/demo purposes and not financial advice
- recommendation and backtesting logic are intentionally simple and explainable, not institutional-grade models

## Tech Stack

- Backend:
  - FastAPI
  - yfinance
  - pandas
  - numpy
- Frontend:
  - Next.js 
  - React 
  - Tailwind CSS
  - Radix UI
  - SWR
  - Recharts

## Project Structure

```text
StockAnalyzer/
├── backend/
│   ├── cli.py
│   ├── main.py
│   └── pyproject.toml
├── frontend/
│   ├── app/
│   ├── components/
│   └── package.json
├── vercel.json
└── README.md
```

## How To Run

### 1. Run the backend

```bash
cd backend
pip install -e .
python3 -m uvicorn main:app --reload --port 8000
```

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Run the CLI

You can also analyze up to 3 stocks directly from the terminal:

```bash
cd backend
python3 cli.py AAPL MSFT GOOGL
```

## Dashboard Tabs

- `Comparison`
- `Price Charts`
- `Financials`
- `Holders`
- `Insights`
- `News & Sentiment`
- `Backtesting`

## Demo

Demo video:

[StockAnalyzer Demo Video](https://youtu.be/5ghnGrWl-SA?si=wDY5NcEY-S8k7ASw)


## Verification

Backend syntax check:

```bash
python3 -m py_compile backend/main.py
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Notes

- StockAnalyzer uses live Yahoo Finance data, so results can vary slightly over time
- the dashboard refreshes major analysis views every 60 seconds
