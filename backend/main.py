import asyncio
import fastapi
import fastapi.middleware.cors
from typing import Optional
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

app = fastapi.FastAPI(title="Stock Analysis API")

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

POSITIVE_NEWS_TERMS = {
    "beat", "growth", "surge", "gain", "record", "upgrade", "bullish", "profit",
    "strong", "expand", "rebound", "outperform", "innovation", "partnership", "approval",
}

NEGATIVE_NEWS_TERMS = {
    "miss", "drop", "fall", "weak", "downgrade", "bearish", "lawsuit", "risk",
    "decline", "warning", "cut", "loss", "slowdown", "investigation", "recall",
}


STATEMENT_SCALE_LABEL = "B"
STATEMENT_SCALE_DIVISOR = 1e9


def safe_get(info: dict, key: str, default=None):
    """Safely get value from dict, handling None and NaN"""
    value = info.get(key, default)
    if value is None:
        return default
    if isinstance(value, float) and (np.isnan(value) or np.isinf(value)):
        return default
    return value


def format_number(value, decimals=2):
    """Format number for display"""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        if abs(value) >= 1e12:
            return f"{value/1e12:.{decimals}f}T"
        elif abs(value) >= 1e9:
            return f"{value/1e9:.{decimals}f}B"
        elif abs(value) >= 1e6:
            return f"{value/1e6:.{decimals}f}M"
        elif abs(value) >= 1e3:
            return f"{value/1e3:.{decimals}f}K"
        return round(value, decimals)
    return value


def choose_statement_scale(df: pd.DataFrame) -> dict[str, float | str]:
    """Use a fixed millions scale for all financial statements."""
    return {"label": STATEMENT_SCALE_LABEL, "divisor": float(STATEMENT_SCALE_DIVISOR)}


def format_number_with_scale(value, scale_divisor=1.0, decimals=2):
    """Format a numeric value using a preselected common scale."""
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return round(value / scale_divisor, decimals)

    return value


def get_currency_symbol(currency: Optional[str]) -> str:
    """Map common Yahoo currency codes to display symbols."""
    mapping = {
        "USD": "$",
        "INR": "₹",
        "EUR": "EUR",
        "GBP": "GBP",
        "JPY": "JPY",
        "CAD": "CAD",
        "AUD": "AUD",
    }
    return mapping.get((currency or "").upper(), currency or "")


def get_latest_statement_value(df: Optional[pd.DataFrame], row_names: list[str]):
    """Return the latest non-null value for the first matching financial statement row."""
    if df is None or df.empty:
        return None

    for row_name in row_names:
        if row_name in df.index:
            series = df.loc[row_name].dropna()
            if not series.empty:
                return float(series.iloc[0])

    return None


def get_debt_to_equity(info: dict, balance_sheet: Optional[pd.DataFrame] = None):
    """Return debt-to-equity as a ratio, not a percentage-scaled vendor value."""
    total_equity = get_latest_statement_value(
        balance_sheet,
        [
            "Stockholders Equity",
            "Total Equity Gross Minority Interest",
            "Common Stock Equity",
        ],
    )
    if total_equity is None:
        total_equity = safe_get(info, "totalStockholderEquity")

    total_debt = get_latest_statement_value(balance_sheet, ["Total Debt", "Net Debt"])
    if total_debt is None:
        total_debt = safe_get(info, "totalDebt")

    if total_debt is not None and total_equity and total_equity != 0:
        return round(total_debt / total_equity, 2)

    raw_debt_to_equity = safe_get(info, "debtToEquity")
    if raw_debt_to_equity is None:
        return None

    normalized = raw_debt_to_equity / 100 if raw_debt_to_equity > 10 else raw_debt_to_equity
    return round(normalized, 2)


def get_dividend_yield(info: dict):
    """Return dividend yield as a decimal fraction for consistent frontend formatting."""
    trailing_yield = safe_get(info, "trailingAnnualDividendYield")
    if trailing_yield is not None:
        normalized = trailing_yield / 100 if trailing_yield > 1 else trailing_yield
        return round(normalized, 4)

    dividend_rate = safe_get(info, "trailingAnnualDividendRate")
    if dividend_rate is None:
        dividend_rate = safe_get(info, "dividendRate")

    price = safe_get(info, "currentPrice")
    if price is None:
        price = safe_get(info, "regularMarketPrice")

    if dividend_rate is not None and price not in (None, 0):
        return round(dividend_rate / price, 4)

    dividend_yield = safe_get(info, "dividendYield")
    if dividend_yield is None:
        return None

    normalized = dividend_yield / 100
    return round(normalized, 4)


def get_roe(info: dict, balance_sheet: Optional[pd.DataFrame] = None):
    """Return ROE as a percentage, normalizing vendor values when needed."""
    net_income = safe_get(info, "netIncomeToCommon")
    total_equity = get_latest_statement_value(
        balance_sheet,
        [
            "Stockholders Equity",
            "Total Equity Gross Minority Interest",
            "Common Stock Equity",
        ],
    )
    if total_equity is None:
        total_equity = safe_get(info, "totalStockholderEquity")

    if net_income is not None and total_equity and total_equity != 0:
        return round((net_income / total_equity) * 100, 2)

    raw_roe = safe_get(info, "returnOnEquity")
    if raw_roe is None:
        return None

    normalized = raw_roe * 100 if abs(raw_roe) <= 1 else raw_roe
    return round(normalized, 2)


def get_one_year_history(ticker: yf.Ticker) -> pd.DataFrame:
    """Fetch one year of unadjusted OHLCV history."""
    return ticker.history(period="1y", auto_adjust=False)


def compute_52_week_range(hist: pd.DataFrame):
    """Compute 52-week range metrics from 1-year OHLC history only."""
    if hist.empty:
        return None

    required_columns = {"High", "Low", "Close"}
    if not required_columns.issubset(hist.columns):
        return None

    high_series = hist["High"].dropna()
    low_series = hist["Low"].dropna()
    close_series = hist["Close"].dropna()

    if high_series.empty or low_series.empty or close_series.empty:
        return None

    high_52w = float(high_series.max())
    low_52w = float(low_series.min())
    current = float(close_series.iloc[-1])

    if high_52w <= low_52w:
        return None
    if high_52w < current:
        return None
    if low_52w > current:
        return None

    range_position = (current - low_52w) / (high_52w - low_52w)
    drawdown = (current - high_52w) / high_52w

    return {
        "high_52w": round(high_52w, 2),
        "low_52w": round(low_52w, 2),
        "range_position_percent": round(range_position * 100, 2),
        "drawdown_percent": round(drawdown * 100, 2),
    }


def tokenize_text(text: str) -> list[str]:
    normalized = "".join(ch.lower() if ch.isalnum() else " " for ch in text or "")
    return [token for token in normalized.split() if token]


def classify_sentiment_score(score: int) -> str:
    if score > 1:
        return "Positive"
    if score < -1:
        return "Negative"
    return "Neutral"


def analyze_news_articles(articles: list[dict]) -> list[dict]:
    analyzed = []
    for article in articles:
        text = f"{article.get('title', '')} {article.get('description', '')}".strip()
        tokens = tokenize_text(text)
        positive_matches = sum(1 for token in tokens if token in POSITIVE_NEWS_TERMS)
        negative_matches = sum(1 for token in tokens if token in NEGATIVE_NEWS_TERMS)
        sentiment_score = positive_matches - negative_matches
        analyzed.append({
            **article,
            "sentiment": classify_sentiment_score(sentiment_score),
            "sentimentScore": sentiment_score,
        })
    return analyzed


def aggregate_news_sentiment(articles: list[dict]) -> dict:
    counts = {"positive": 0, "neutral": 0, "negative": 0}
    sentiment_score = 0

    for article in articles:
        sentiment = article.get("sentiment")
        if sentiment == "Positive":
            counts["positive"] += 1
            sentiment_score += 1
        elif sentiment == "Negative":
            counts["negative"] += 1
            sentiment_score -= 1
        else:
            counts["neutral"] += 1

    overall = "Neutral"
    if sentiment_score > 0:
        overall = "Positive"
    elif sentiment_score < 0:
        overall = "Negative"

    return {
        "overallSentiment": overall,
        "sentimentScore": sentiment_score,
        "counts": counts,
    }


def compute_trend_metrics(hist: pd.DataFrame) -> dict:
    price_change_1m = None
    price_change_3m = None
    volume_trend = None
    sma_20 = None
    sma_50 = None
    moving_average_signal = "Neutral"

    if not hist.empty and "Close" in hist.columns and len(hist) >= 20:
        close_series = hist["Close"].dropna()
        if len(close_series) >= 20:
            sma_20 = float(close_series.tail(20).mean())
        if len(close_series) >= 50:
            sma_50 = float(close_series.tail(50).mean())

        if sma_20 is not None and sma_50 is not None and not close_series.empty:
            current_price = float(close_series.iloc[-1])
            if current_price > sma_20 > sma_50:
                moving_average_signal = "Bullish"
            elif current_price < sma_20 < sma_50:
                moving_average_signal = "Bearish"

    if not hist.empty and len(hist) > 20:
        current_price = hist["Close"].iloc[-1]

        if len(hist) >= 22:
            price_1m_ago = hist["Close"].iloc[-22]
            price_change_1m = ((current_price - price_1m_ago) / price_1m_ago) * 100

        if len(hist) >= 66:
            price_3m_ago = hist["Close"].iloc[-66]
            price_change_3m = ((current_price - price_3m_ago) / price_3m_ago) * 100

        recent_vol = hist["Volume"].iloc[-5:].mean()
        older_vol = hist["Volume"].iloc[-22:-5].mean()
        if older_vol > 0:
            volume_trend = ((recent_vol - older_vol) / older_vol) * 100

    return {
        "priceChange1m": round(price_change_1m, 2) if price_change_1m is not None else None,
        "priceChange3m": round(price_change_3m, 2) if price_change_3m is not None else None,
        "volumeTrend": round(volume_trend, 2) if volume_trend is not None else None,
        "sma20": round(sma_20, 2) if sma_20 is not None else None,
        "sma50": round(sma_50, 2) if sma_50 is not None else None,
        "movingAverageSignal": moving_average_signal,
    }


def get_trend_label(metrics: dict) -> str:
    moving_average_signal = metrics.get("movingAverageSignal")
    if moving_average_signal == "Bullish":
        return "Uptrend"
    if moving_average_signal == "Bearish":
        return "Downtrend"

    price_change_1m = metrics.get("priceChange1m")
    price_change_3m = metrics.get("priceChange3m")

    if (
        isinstance(price_change_1m, (int, float))
        and isinstance(price_change_3m, (int, float))
        and price_change_1m > 0
        and price_change_3m > 0
    ):
        return "Uptrend"

    if (
        isinstance(price_change_1m, (int, float))
        and isinstance(price_change_3m, (int, float))
        and price_change_1m < 0
        and price_change_3m < 0
    ):
        return "Downtrend"

    return "Sideways"


def build_recommendation_payload(symbol: str, info: dict, balance_sheet: Optional[pd.DataFrame], hist: pd.DataFrame) -> dict:
    pe = safe_get(info, "trailingPE")
    forward_pe = safe_get(info, "forwardPE")
    roe = get_roe(info, balance_sheet)
    debt_to_equity = get_debt_to_equity(info, balance_sheet)
    dividend_yield = get_dividend_yield(info)
    beta = safe_get(info, "beta")
    trend_metrics = compute_trend_metrics(hist)

    long_term_signals = []
    short_term_signals = []
    long_term_score = 0
    short_term_score = 0

    if roe is not None:
        if roe > 15:
            long_term_signals.append({"type": "positive", "message": f"Strong ROE of {roe:.1f}% indicates efficient use of equity"})
            long_term_score += 2
        elif roe > 10:
            long_term_signals.append({"type": "neutral", "message": f"Moderate ROE of {roe:.1f}%"})
            long_term_score += 1
        else:
            long_term_signals.append({"type": "negative", "message": f"Low ROE of {roe:.1f}% may indicate inefficiency"})
            long_term_score -= 1

    if debt_to_equity is not None:
        if debt_to_equity < 0.5:
            long_term_signals.append({"type": "positive", "message": f"Low debt-to-equity ratio of {debt_to_equity:.2f} indicates financial stability"})
            long_term_score += 2
        elif debt_to_equity < 1:
            long_term_signals.append({"type": "neutral", "message": f"Moderate debt-to-equity ratio of {debt_to_equity:.2f}"})
            long_term_score += 1
        else:
            long_term_signals.append({"type": "negative", "message": f"High debt-to-equity ratio of {debt_to_equity:.2f} may pose risks"})
            long_term_score -= 1

    if pe is not None and forward_pe is not None:
        if forward_pe < pe:
            long_term_signals.append({"type": "positive", "message": f"Forward P/E ({forward_pe:.1f}) lower than trailing P/E ({pe:.1f}) suggests expected earnings growth"})
            long_term_score += 1
        elif forward_pe > pe * 1.2:
            long_term_signals.append({"type": "negative", "message": f"Forward P/E ({forward_pe:.1f}) higher than trailing P/E ({pe:.1f}) suggests expected earnings decline"})
            long_term_score -= 1

    if dividend_yield is not None and dividend_yield > 0.02:
        long_term_signals.append({"type": "positive", "message": f"Dividend yield of {dividend_yield*100:.2f}% provides income"})
        long_term_score += 1

    price_change_1m = trend_metrics["priceChange1m"]
    price_change_3m = trend_metrics["priceChange3m"]
    volume_trend = trend_metrics["volumeTrend"]
    sma_20 = trend_metrics["sma20"]
    sma_50 = trend_metrics["sma50"]
    moving_average_signal = trend_metrics["movingAverageSignal"]

    if price_change_1m is not None:
        if price_change_1m > 5:
            short_term_signals.append({"type": "positive", "message": f"Strong 1-month momentum: +{price_change_1m:.1f}%"})
            short_term_score += 2
        elif price_change_1m < -5:
            short_term_signals.append({"type": "negative", "message": f"Weak 1-month momentum: {price_change_1m:.1f}%"})
            short_term_score -= 1
        else:
            short_term_signals.append({"type": "neutral", "message": f"Flat 1-month price movement: {price_change_1m:.1f}%"})

    if volume_trend is not None:
        if volume_trend > 20:
            short_term_signals.append({"type": "positive", "message": f"Volume spike: +{volume_trend:.1f}% above average (increased interest)"})
            short_term_score += 1
        elif volume_trend < -20:
            short_term_signals.append({"type": "negative", "message": f"Declining volume: {volume_trend:.1f}% (reduced interest)"})
            short_term_score -= 1

    if sma_20 is not None and sma_50 is not None:
        if moving_average_signal == "Bullish":
            short_term_signals.append({"type": "positive", "message": f"Bullish moving-average setup: price is above SMA20 ({sma_20:.2f}) and SMA50 ({sma_50:.2f})"})
            short_term_score += 2
        elif moving_average_signal == "Bearish":
            short_term_signals.append({"type": "negative", "message": f"Bearish moving-average setup: price is below SMA20 ({sma_20:.2f}) and SMA50 ({sma_50:.2f})"})
            short_term_score -= 2
        else:
            short_term_signals.append({"type": "neutral", "message": f"Mixed moving-average setup around SMA20 ({sma_20:.2f}) and SMA50 ({sma_50:.2f})"})

    if beta is not None:
        if beta > 1.5:
            short_term_signals.append({"type": "warning", "message": f"High beta of {beta:.2f} indicates high volatility"})
        elif beta < 0.8:
            short_term_signals.append({"type": "neutral", "message": f"Low beta of {beta:.2f} indicates lower volatility than market"})

    def get_recommendation_text(score):
        if score >= 4:
            return "Strong Buy"
        elif score >= 2:
            return "Buy"
        elif score >= 0:
            return "Hold"
        elif score >= -2:
            return "Sell"
        else:
            return "Strong Sell"

    return {
        "symbol": symbol,
        "name": safe_get(info, "longName", symbol),
        "longTerm": {
            "recommendation": get_recommendation_text(long_term_score),
            "score": long_term_score,
            "signals": long_term_signals,
        },
        "shortTerm": {
            "recommendation": get_recommendation_text(short_term_score),
            "score": short_term_score,
            "signals": short_term_signals,
        },
        "metrics": {
            "pe": pe,
            "forwardPE": forward_pe,
            "roe": roe,
            "debtToEquity": debt_to_equity,
            "dividendYield": dividend_yield,
            "beta": beta,
            **trend_metrics,
        }
    }


def build_ai_analysis(payload: dict, news_analysis: dict, stock_info: dict) -> dict:
    metrics = payload["metrics"]
    score = 50
    bullish = []
    bearish = []

    roe = metrics.get("roe")
    if isinstance(roe, (int, float)):
        if roe >= 20:
            score += 14
            bullish.append(f"Strong ROE of {roe:.1f}%")
        elif roe >= 12:
            score += 8
            bullish.append(f"Healthy ROE of {roe:.1f}%")
        elif roe < 6:
            score -= 10
            bearish.append(f"Low ROE of {roe:.1f}%")

    debt_to_equity = metrics.get("debtToEquity")
    if isinstance(debt_to_equity, (int, float)):
        if debt_to_equity <= 0.5:
            score += 10
            bullish.append(f"Low debt-to-equity at {debt_to_equity:.2f}")
        elif debt_to_equity >= 2:
            score -= 12
            bearish.append(f"High debt-to-equity at {debt_to_equity:.2f}")

    pe = metrics.get("pe")
    forward_pe = metrics.get("forwardPE")
    if isinstance(pe, (int, float)) and isinstance(forward_pe, (int, float)):
        if forward_pe < pe:
            score += 6
            bullish.append("Forward P/E is below trailing P/E")
        elif forward_pe > pe * 1.2:
            score -= 6
            bearish.append("Forward P/E is materially above trailing P/E")

    price_change_3m = metrics.get("priceChange3m")
    if isinstance(price_change_3m, (int, float)):
        if price_change_3m >= 10:
            score += 12
            bullish.append(f"Strong 3-month momentum at +{price_change_3m:.1f}%")
        elif price_change_3m > 0:
            score += 5
            bullish.append(f"Positive 3-month momentum at +{price_change_3m:.1f}%")
        elif price_change_3m <= -10:
            score -= 12
            bearish.append(f"Weak 3-month momentum at {price_change_3m:.1f}%")
        elif price_change_3m < 0:
            score -= 5
            bearish.append(f"Negative 3-month momentum at {price_change_3m:.1f}%")

    moving_average_signal = metrics.get("movingAverageSignal")
    sma_20 = metrics.get("sma20")
    sma_50 = metrics.get("sma50")
    if moving_average_signal == "Bullish":
        score += 10
        bullish.append(
            f"Moving averages are bullish with SMA20 at {sma_20:.2f} above SMA50 at {sma_50:.2f}"
        )
    elif moving_average_signal == "Bearish":
        score -= 10
        bearish.append(
            f"Moving averages are bearish with SMA20 at {sma_20:.2f} below SMA50 at {sma_50:.2f}"
        )

    price_change_1m = metrics.get("priceChange1m")
    if isinstance(price_change_1m, (int, float)):
        if price_change_1m >= 4:
            score += 4
        elif price_change_1m <= -4:
            score -= 4

    overall_sentiment = news_analysis.get("overallSentiment", "Neutral")
    if overall_sentiment == "Positive":
        score += 10
        bullish.append(f"Recent news flow is positive across {len(news_analysis.get('articles', []))} articles")
    elif overall_sentiment == "Negative":
        score -= 10
        bearish.append(f"Recent news flow is negative across {len(news_analysis.get('articles', []))} articles")

    dividend_yield = metrics.get("dividendYield")
    if isinstance(dividend_yield, (int, float)) and dividend_yield >= 0.02:
        score += 4
        bullish.append(f"Dividend yield of {dividend_yield * 100:.2f}% supports shareholder returns")

    beta = metrics.get("beta")
    if isinstance(beta, (int, float)) and beta >= 1.7:
        score -= 4
        bearish.append(f"High beta of {beta:.2f} increases volatility risk")

    score = max(0, min(100, score))
    view = "BUY" if score >= 65 else "SELL" if score <= 35 else "HOLD"
    confidence = max(45, min(92, round(45 + abs(score - 50) * 1.2)))

    summary_lines = [
        "Outlook",
        f"{payload.get('name', stock_info.get('name', payload.get('symbol')))} currently scores {score}/100 in the local Python AI engine, which results in a {view} view with {confidence}% confidence.",
        "",
        "Drivers",
        *(f"- {item}" for item in (bullish[:3] or ["No strong bullish drivers were detected from the available data."])),
        "",
        "Risks",
        *(f"- {item}" for item in (bearish[:3] or ["No major risk signal stood out in the current dataset."])),
        "",
        f"AI View: {view}",
    ]

    return {
        "stock": payload["symbol"],
        "score": score,
        "confidence": confidence,
        "view": view,
        "summary": "\n".join(summary_lines),
        "bullishFactors": bullish,
        "bearishFactors": bearish,
        "meta": {
            "price": stock_info.get("price"),
            "dailyChange": stock_info.get("change"),
            "newsSentiment": overall_sentiment,
            "articleCount": len(news_analysis.get("articles", [])),
            "trend": get_trend_label(metrics),
        },
    }


def extract_yahoo_news_articles(symbol: str, limit: int = 8) -> list[dict]:
    """Normalize Yahoo Finance news items for reuse across endpoints."""
    ticker = yf.Ticker(symbol)
    news_items = ticker.news or []
    articles = []

    for item in news_items[: max(1, min(limit, 10))]:
        content = item.get("content", {})
        canonical_url = content.get("canonicalUrl", {})
        provider = content.get("provider", {})

        url = canonical_url.get("url")
        title = content.get("title")
        if not url or not title:
            continue

        articles.append({
            "title": title,
            "description": content.get("summary") or content.get("description") or "",
            "url": url,
            "publishedAt": content.get("pubDate") or content.get("displayTime"),
            "provider": provider.get("displayName"),
        })

    return articles


def calculate_max_drawdown(equity_curve: pd.Series) -> float:
    if equity_curve.empty:
        return 0.0
    rolling_peak = equity_curve.cummax()
    drawdown = (equity_curve / rolling_peak) - 1
    return float(drawdown.min())


def compute_rsi(close_series: pd.Series, window: int = 14) -> pd.Series:
    delta = close_series.diff()
    gains = delta.clip(lower=0)
    losses = -delta.clip(upper=0)
    avg_gain = gains.rolling(window).mean()
    avg_loss = losses.rolling(window).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50)


def run_moving_average_backtest(hist: pd.DataFrame) -> dict:
    """Backtest a trend-following strategy with SMA and RSI confirmation."""
    if hist.empty or "Close" not in hist.columns:
        return {"error": "No historical data available for backtesting"}

    prices = hist[["Close"]].dropna().copy()
    if len(prices) < 80:
        return {"error": "Not enough historical data for backtesting"}

    risk_pct = 0.08
    reward_pct = risk_pct * 3

    prices["sma20"] = prices["Close"].rolling(20).mean()
    prices["sma50"] = prices["Close"].rolling(50).mean()
    prices["rsi14"] = compute_rsi(prices["Close"])
    prices["trendSignal"] = (
        (prices["Close"] > prices["sma20"]) &
        (prices["sma20"] > prices["sma50"]) &
        (prices["rsi14"] >= 50) &
        (prices["rsi14"] <= 70)
    )
    prices["dailyReturn"] = prices["Close"].pct_change().fillna(0.0)

    positions = []
    trades = []
    in_position = False
    entry = None
    entry_price = 0.0
    peak_price = 0.0

    for idx, row in prices.iterrows():
        close_price = float(row["Close"])
        bullish_setup = bool(row["trendSignal"]) and pd.notna(row["sma50"])
        bearish_exit = (
            (pd.notna(row["sma20"]) and close_price < float(row["sma20"])) or
            row["rsi14"] < 45
        )

        if not in_position and bullish_setup:
            in_position = True
            entry_price = close_price
            peak_price = close_price
            entry = {
                "entryTimestamp": idx,
                "entryDate": str(idx.date()),
                "entryPrice": round(entry_price, 2),
                "entryRsi": round(float(row["rsi14"]), 2),
                "entrySignal": "Trend + RSI confirmation",
            }
        elif in_position:
            peak_price = max(peak_price, close_price)
            trailing_stop_hit = close_price <= peak_price * (1 - risk_pct)
            take_profit_hit = close_price >= entry_price * (1 + reward_pct)

            if bearish_exit or trailing_stop_hit or take_profit_hit:
                exit_reason = "SMA20 breakdown / RSI weakness"
                if trailing_stop_hit:
                    exit_reason = "1:3 risk-reward trailing stop"
                elif take_profit_hit:
                    exit_reason = "1:3 risk-reward take profit"

                trade_return = ((close_price - entry_price) / entry_price) * 100
                trades.append({
                    **{key: value for key, value in entry.items() if key != "entryTimestamp"},
                    "exitDate": str(idx.date()),
                    "exitPrice": round(close_price, 2),
                    "returnPercent": round(trade_return, 2),
                    "exitRsi": round(float(row["rsi14"]), 2),
                    "exitReason": exit_reason,
                    "holdingDays": int((idx - entry["entryTimestamp"]).days),
                })
                in_position = False
                entry = None
                entry_price = 0.0
                peak_price = 0.0

        positions.append(1 if in_position else 0)

    prices["position"] = pd.Series(positions, index=prices.index, dtype=float)
    prices["strategyReturn"] = prices["position"].shift(1).fillna(0.0) * prices["dailyReturn"]
    prices["equityCurve"] = (1 + prices["strategyReturn"]).cumprod()
    prices["buyHoldCurve"] = (1 + prices["dailyReturn"]).cumprod()
    prices["positionChange"] = prices["position"].diff().fillna(prices["position"])

    if in_position and entry is not None:
        final_close = float(prices["Close"].iloc[-1])
        trade_return = ((final_close - entry_price) / entry_price) * 100
        trades.append({
            **{key: value for key, value in entry.items() if key != "entryTimestamp"},
            "exitDate": "Open",
            "exitPrice": round(final_close, 2),
            "returnPercent": round(trade_return, 2),
            "exitRsi": round(float(prices["rsi14"].iloc[-1]), 2),
            "exitReason": "Position still open",
            "holdingDays": int((prices.index[-1] - entry["entryTimestamp"]).days),
        })

    completed_trades = [trade for trade in trades if trade["exitDate"] != "Open"]
    wins = [trade for trade in completed_trades if trade["returnPercent"] > 0]
    exposure_days = int(prices["position"].sum())
    avg_trade = float(np.mean([trade["returnPercent"] for trade in completed_trades])) if completed_trades else 0.0
    best_trade = float(max((trade["returnPercent"] for trade in completed_trades), default=0.0))
    worst_trade = float(min((trade["returnPercent"] for trade in completed_trades), default=0.0))
    current_signal = "Bullish" if bool(prices["trendSignal"].iloc[-1]) else "Bearish" if (
        pd.notna(prices["sma20"].iloc[-1]) and pd.notna(prices["sma50"].iloc[-1]) and
        float(prices["Close"].iloc[-1]) < float(prices["sma20"].iloc[-1]) < float(prices["sma50"].iloc[-1])
    ) else "Neutral"

    return {
        "strategy": "SMA20/SMA50 + RSI momentum filter with stop-loss/take-profit",
        "rules": [
            "Enter long when price > SMA20 > SMA50 and RSI14 is between 50 and 70.",
            "Use a 1:3 risk-reward framework with an 8% trailing stop and a 24% take-profit target.",
            "Exit when price closes below SMA20, RSI14 drops below 45, the trailing stop is hit, or the take-profit target is reached.",
            "Stay in cash when trend and momentum conditions are not aligned.",
        ],
        "periodStart": str(prices.index[0].date()),
        "periodEnd": str(prices.index[-1].date()),
        "signals": {
            "currentSignal": current_signal,
            "buySignals": int((prices["positionChange"] > 0).sum()),
            "sellSignals": int((prices["positionChange"] < 0).sum()),
        },
        "metrics": {
            "totalReturnPercent": round((prices["equityCurve"].iloc[-1] - 1) * 100, 2),
            "buyHoldReturnPercent": round((prices["buyHoldCurve"].iloc[-1] - 1) * 100, 2),
            "maxDrawdownPercent": round(calculate_max_drawdown(prices["equityCurve"]) * 100, 2),
            "winRatePercent": round((len(wins) / len(completed_trades)) * 100, 2) if completed_trades else 0.0,
            "tradeCount": len(trades),
            "exposurePercent": round((exposure_days / len(prices)) * 100, 2),
            "avgTradeReturnPercent": round(avg_trade, 2),
            "bestTradePercent": round(best_trade, 2),
            "worstTradePercent": round(worst_trade, 2),
        },
        "latest": {
            "close": round(float(prices["Close"].iloc[-1]), 2),
            "sma20": round(float(prices["sma20"].iloc[-1]), 2) if pd.notna(prices["sma20"].iloc[-1]) else None,
            "sma50": round(float(prices["sma50"].iloc[-1]), 2) if pd.notna(prices["sma50"].iloc[-1]) else None,
            "rsi14": round(float(prices["rsi14"].iloc[-1]), 2) if pd.notna(prices["rsi14"].iloc[-1]) else None,
        },
        "trades": trades[-8:],
    }


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


def _search_stock_sync(query: str) -> dict:
    """Synchronous stock search (runs in thread pool)"""
    ticker = yf.Ticker(query.upper())
    info = ticker.info

    if not info or info.get("regularMarketPrice") is None:
        suffixes = ["", ".NS", ".BO", ".L", ".TO"]
        results = []
        for suffix in suffixes:
            try:
                test_ticker = yf.Ticker(f"{query.upper()}{suffix}")
                test_info = test_ticker.info
                if test_info and test_info.get("regularMarketPrice"):
                    currency = safe_get(test_info, "currency", "USD")
                    results.append({
                        "symbol": f"{query.upper()}{suffix}",
                        "name": safe_get(test_info, "longName", query.upper()),
                        "sector": safe_get(test_info, "sector", "N/A"),
                        "industry": safe_get(test_info, "industry", "N/A"),
                        "marketCap": safe_get(test_info, "marketCap"),
                        "price": safe_get(test_info, "regularMarketPrice"),
                        "change": safe_get(test_info, "regularMarketChangePercent"),
                        "currency": currency,
                        "currencySymbol": get_currency_symbol(currency),
                    })
            except Exception:
                continue
        return {"results": results}

    currency = safe_get(info, "currency", "USD")
    return {
        "results": [{
            "symbol": query.upper(),
            "name": safe_get(info, "longName", query.upper()),
            "sector": safe_get(info, "sector", "N/A"),
            "industry": safe_get(info, "industry", "N/A"),
            "marketCap": safe_get(info, "marketCap"),
            "price": safe_get(info, "regularMarketPrice"),
            "change": safe_get(info, "regularMarketChangePercent"),
            "currency": currency,
            "currencySymbol": get_currency_symbol(currency),
        }]
    }


@app.get("/search-stock")
async def search_stock(query: str):
    """Search for stocks by name or symbol"""
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(_search_stock_sync, query),
            timeout=15.0,
        )
        return result
    except asyncio.TimeoutError:
        return {"results": [], "error": "Search timed out. Try a different symbol."}
    except Exception as e:
        return {"results": [], "error": str(e)}


@app.get("/stock-info/{symbol}")
async def get_stock_info(symbol: str):
    """Get detailed stock information"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = get_one_year_history(ticker)
        range_metrics = compute_52_week_range(hist)
        
        return {
            "symbol": symbol,
            "name": safe_get(info, "longName", symbol),
            "currency": safe_get(info, "currency", "USD"),
            "currencySymbol": get_currency_symbol(safe_get(info, "currency", "USD")),
            "sector": safe_get(info, "sector", "N/A"),
            "industry": safe_get(info, "industry", "N/A"),
            "description": safe_get(info, "longBusinessSummary", ""),
            "website": safe_get(info, "website", ""),
            "marketCap": safe_get(info, "marketCap"),
            "marketCapFormatted": format_number(safe_get(info, "marketCap")),
            "price": safe_get(info, "regularMarketPrice"),
            "previousClose": safe_get(info, "previousClose"),
            "open": safe_get(info, "open"),
            "dayHigh": safe_get(info, "dayHigh"),
            "dayLow": safe_get(info, "dayLow"),
            "fiftyTwoWeekHigh": range_metrics["high_52w"] if range_metrics else None,
            "fiftyTwoWeekLow": range_metrics["low_52w"] if range_metrics else None,
            "rangePositionPercent": range_metrics["range_position_percent"] if range_metrics else None,
            "drawdownPercent": range_metrics["drawdown_percent"] if range_metrics else None,
            "volume": safe_get(info, "volume"),
            "avgVolume": safe_get(info, "averageVolume"),
            "pe": safe_get(info, "trailingPE"),
            "forwardPE": safe_get(info, "forwardPE"),
            "eps": safe_get(info, "trailingEps"),
            "dividend": get_dividend_yield(info),
            "beta": safe_get(info, "beta"),
            "change": safe_get(info, "regularMarketChangePercent"),
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/compare")
async def compare_stocks(symbols: str):
    """Compare multiple stocks (comma-separated)"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")][:5]  # Max 5 stocks
        comparison = []
        
        for symbol in symbol_list:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = get_one_year_history(ticker)
                range_metrics = compute_52_week_range(hist)
                balance_sheet = ticker.balance_sheet
                
                # Get financial data
                revenue = safe_get(info, "totalRevenue")
                net_income = safe_get(info, "netIncomeToCommon")
                total_equity = safe_get(info, "totalStockholderEquity")
                
                roe = get_roe(info, balance_sheet)
                debt_to_equity = get_debt_to_equity(info, balance_sheet)
                dividend_yield = get_dividend_yield(info)
                
                comparison.append({
                    "symbol": symbol,
                    "name": safe_get(info, "longName", symbol),
                    "currency": safe_get(info, "currency", "USD"),
                    "currencySymbol": get_currency_symbol(safe_get(info, "currency", "USD")),
                    "sector": safe_get(info, "sector", "N/A"),
                    "price": safe_get(info, "regularMarketPrice"),
                    "change": safe_get(info, "regularMarketChangePercent"),
                    "marketCap": safe_get(info, "marketCap"),
                    "marketCapFormatted": format_number(safe_get(info, "marketCap")),
                    "revenue": revenue,
                    "revenueFormatted": format_number(revenue),
                    "netProfit": net_income,
                    "netProfitFormatted": format_number(net_income),
                    "roe": roe,
                    "pe": safe_get(info, "trailingPE"),
                    "forwardPE": safe_get(info, "forwardPE"),
                    "debtToEquity": debt_to_equity,
                    "eps": safe_get(info, "trailingEps"),
                    "dividendYield": dividend_yield,
                    "beta": safe_get(info, "beta"),
                    "fiftyTwoWeekHigh": range_metrics["high_52w"] if range_metrics else None,
                    "fiftyTwoWeekLow": range_metrics["low_52w"] if range_metrics else None,
                    "rangePositionPercent": range_metrics["range_position_percent"] if range_metrics else None,
                    "drawdownPercent": range_metrics["drawdown_percent"] if range_metrics else None,
                })
            except Exception as e:
                comparison.append({
                    "symbol": symbol,
                    "error": str(e)
                })
        
        return {"comparison": comparison}
    except Exception as e:
        return {"error": str(e)}


@app.get("/financials/{symbol}")
async def get_financials(symbol: str, statement: str = "income"):
    """Get financial statements (income, balance, cashflow)"""
    try:
        ticker = yf.Ticker(symbol)
        
        if statement == "income":
            df = ticker.income_stmt
            title = "Income Statement"
        elif statement == "balance":
            df = ticker.balance_sheet
            title = "Balance Sheet"
        elif statement == "cashflow":
            df = ticker.cashflow
            title = "Cash Flow Statement"
        else:
            return {"error": "Invalid statement type. Use: income, balance, or cashflow"}
        
        if df is None or df.empty:
            return {"error": "No financial data available"}

        scale = choose_statement_scale(df)
        currency = safe_get(ticker.info, "currency", "USD")
        
        # Convert DataFrame to dict
        data = []
        for idx in df.index:
            row = {"item": str(idx)}
            for col in df.columns:
                value = df.loc[idx, col]
                if pd.notna(value):
                    row[str(col.date())] = float(value)
                    row[f"{str(col.date())}Formatted"] = format_number_with_scale(float(value), scale["divisor"])
                else:
                    row[str(col.date())] = None
                    row[f"{str(col.date())}Formatted"] = None
            data.append(row)
        
        periods = [str(col.date()) for col in df.columns]
        
        return {
            "symbol": symbol,
            "title": title,
            "currency": currency,
            "currencySymbol": get_currency_symbol(currency),
            "scaleLabel": scale["label"],
            "scaleDivisor": scale["divisor"],
            "periods": periods,
            "data": data
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/holders/{symbol}")
async def get_holders(symbol: str):
    """Get institutional and insider holdings"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        balance_sheet = ticker.balance_sheet
        
        # Get holder information
        institutional_holders = None
        major_holders = None
        mutual_fund_holders = None
        institutional_holding = safe_get(info, "heldPercentInstitutions")
        insider_holding = safe_get(info, "heldPercentInsiders")
        
        try:
            ih = ticker.institutional_holders
            if ih is not None and not ih.empty:
                institutional_holders = ih.head(10).to_dict('records')
                for holder in institutional_holders:
                    for key, value in holder.items():
                        if pd.isna(value):
                            holder[key] = None
                        elif isinstance(value, (pd.Timestamp, datetime)):
                            holder[key] = str(value)
        except:
            pass
        
        try:
            mh = ticker.major_holders
            if mh is not None and not mh.empty:
                major_holders = []
                for idx, row in mh.iterrows():
                    value = row.iloc[0] if len(row) > 0 and pd.notna(row.iloc[0]) else None
                    description = str(idx)
                    major_holders.append({
                        "value": str(value) if value is not None else None,
                        "description": description
                    })

                if "institutionsPercentHeld" in mh.index and pd.notna(mh.loc["institutionsPercentHeld"].iloc[0]):
                    institutional_holding = float(mh.loc["institutionsPercentHeld"].iloc[0])
                if "insidersPercentHeld" in mh.index and pd.notna(mh.loc["insidersPercentHeld"].iloc[0]):
                    insider_holding = float(mh.loc["insidersPercentHeld"].iloc[0])
        except:
            pass

        try:
            mf = ticker.mutualfund_holders
            if mf is not None and not mf.empty:
                mutual_fund_holders = mf.head(10).to_dict('records')
                for holder in mutual_fund_holders:
                    for key, value in holder.items():
                        if pd.isna(value):
                            holder[key] = None
                        elif isinstance(value, (pd.Timestamp, datetime)):
                            holder[key] = str(value)
        except:
            pass
        
        return {
            "symbol": symbol,
            "institutionalHolding": institutional_holding,
            "insiderHolding": insider_holding,
            "institutionalHolders": institutional_holders,
            "majorHolders": major_holders,
            "mutualFundHolders": mutual_fund_holders,
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/news/{symbol}")
async def get_news(symbol: str, limit: int = 8):
    """Get latest Yahoo Finance news articles for a symbol."""
    try:
        articles = extract_yahoo_news_articles(symbol, limit)
        return {
            "symbol": symbol,
            "articles": articles,
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/news-analysis/{symbol}")
async def get_news_analysis(symbol: str, limit: int = 8):
    """Run from-scratch Python sentiment analysis on Yahoo Finance news."""
    try:
        articles = analyze_news_articles(extract_yahoo_news_articles(symbol, limit))
        aggregate = aggregate_news_sentiment(articles)
        return {
            "stock": symbol,
            "overallSentiment": aggregate["overallSentiment"],
            "sentimentScore": aggregate["sentimentScore"],
            "counts": aggregate["counts"],
            "articles": articles,
        }
    except Exception as e:
        return {
            "stock": symbol,
            "overallSentiment": "Neutral",
            "sentimentScore": 0,
            "counts": {"positive": 0, "neutral": 0, "negative": 0},
            "articles": [],
            "error": str(e),
        }


@app.get("/price-history/{symbol}")
async def get_price_history(symbol: str, period: str = "1y"):
    """Get historical price data"""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        
        if hist.empty:
            return {"error": "No historical data available"}
        
        data = []
        for idx, row in hist.iterrows():
            data.append({
                "date": str(idx.date()),
                "open": round(row["Open"], 2) if pd.notna(row["Open"]) else None,
                "high": round(row["High"], 2) if pd.notna(row["High"]) else None,
                "low": round(row["Low"], 2) if pd.notna(row["Low"]) else None,
                "close": round(row["Close"], 2) if pd.notna(row["Close"]) else None,
                "volume": int(row["Volume"]) if pd.notna(row["Volume"]) else None,
            })
        
        return {
            "symbol": symbol,
            "period": period,
            "data": data
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/range-analysis/{symbol}")
async def get_range_analysis(symbol: str):
    """Return computed 52-week range metrics from 1-year OHLC history."""
    try:
        ticker = yf.Ticker(symbol)
        hist = get_one_year_history(ticker)
        range_metrics = compute_52_week_range(hist)

        if range_metrics is None:
            return {"error": "Unable to compute 52-week range from 1-year history"}

        return {
            "symbol": symbol,
            **range_metrics,
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/recommendation/{symbol}")
async def get_recommendation(symbol: str):
    """Get Python-based stock recommendations from local analysis logic."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        balance_sheet = ticker.balance_sheet
        hist = get_one_year_history(ticker)
        return build_recommendation_payload(symbol, info, balance_sheet, hist)
    except Exception as e:
        return {"error": str(e)}


@app.get("/ai-analysis/{symbol}")
async def get_ai_analysis(symbol: str):
    """Run the local Python AI engine for reasoning and BUY/SELL/HOLD output."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        balance_sheet = ticker.balance_sheet
        hist = get_one_year_history(ticker)

        recommendation_payload = build_recommendation_payload(symbol, info, balance_sheet, hist)
        news_articles = analyze_news_articles(extract_yahoo_news_articles(symbol, 8))
        news_aggregate = aggregate_news_sentiment(news_articles)
        news_analysis = {
            **news_aggregate,
            "articles": news_articles,
        }
        stock_info = {
            "symbol": symbol,
            "name": safe_get(info, "longName", symbol),
            "price": safe_get(info, "regularMarketPrice"),
            "change": safe_get(info, "regularMarketChangePercent"),
        }

        return build_ai_analysis(recommendation_payload, news_analysis, stock_info)
    except Exception as e:
        return {
            "stock": symbol,
            "score": None,
            "confidence": None,
            "view": None,
            "summary": "",
            "bullishFactors": [],
            "bearishFactors": [],
            "error": str(e),
        }


@app.get("/backtest/{symbol}")
async def get_backtest(symbol: str, period: str = "2y"):
    """Run a simple moving-average backtest for a stock."""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, auto_adjust=False)
        result = run_moving_average_backtest(hist)
        if "error" in result:
            return {"symbol": symbol, **result}
        return {"symbol": symbol, **result}
    except Exception as e:
        return {"symbol": symbol, "error": str(e)}


@app.get("/screener")
async def stock_screener(
    sector: Optional[str] = None,
    min_market_cap: Optional[float] = None,
    max_pe: Optional[float] = None,
    min_roe: Optional[float] = None,
):
    """Screen stocks based on criteria"""
    # Sample popular stocks to screen
    sample_stocks = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "JPM", 
        "V", "JNJ", "WMT", "PG", "UNH", "HD", "BAC", "XOM", "CVX",
        "KO", "PEP", "ABBV", "MRK", "COST", "AVGO", "TMO", "CSCO"
    ]
    
    results = []
    
    for symbol in sample_stocks:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            balance_sheet = ticker.balance_sheet
            
            stock_sector = safe_get(info, "sector")
            market_cap = safe_get(info, "marketCap")
            pe = safe_get(info, "trailingPE")
            
            roe = get_roe(info, balance_sheet)
            
            # Apply filters
            if sector and stock_sector and sector.lower() not in stock_sector.lower():
                continue
            if min_market_cap and (not market_cap or market_cap < min_market_cap):
                continue
            if max_pe and (not pe or pe > max_pe):
                continue
            if min_roe and (not roe or roe < min_roe):
                continue
            
            results.append({
                "symbol": symbol,
                "name": safe_get(info, "longName", symbol),
                "sector": stock_sector,
                "price": safe_get(info, "regularMarketPrice"),
                "change": safe_get(info, "regularMarketChangePercent"),
                "marketCap": market_cap,
                "marketCapFormatted": format_number(market_cap),
                "pe": pe,
                "roe": roe,
            })
            
            if len(results) >= 10:
                break
                
        except:
            continue
    
    return {"results": results}
