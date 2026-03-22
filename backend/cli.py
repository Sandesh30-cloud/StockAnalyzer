import argparse
import json

import yfinance as yf

from main import (
    aggregate_news_sentiment,
    analyze_news_articles,
    build_ai_analysis,
    build_recommendation_payload,
    extract_yahoo_news_articles,
    get_one_year_history,
    safe_get,
)


def analyze_symbol(symbol: str) -> dict:
    ticker = yf.Ticker(symbol)
    info = ticker.info
    balance_sheet = ticker.balance_sheet
    hist = get_one_year_history(ticker)

    recommendation = build_recommendation_payload(symbol, info, balance_sheet, hist)
    articles = analyze_news_articles(extract_yahoo_news_articles(symbol, 5))
    news_summary = aggregate_news_sentiment(articles)
    ai_analysis = build_ai_analysis(
        recommendation,
        {**news_summary, "articles": articles},
        {
            "symbol": symbol,
            "name": safe_get(info, "longName", symbol),
            "price": safe_get(info, "regularMarketPrice"),
            "change": safe_get(info, "regularMarketChangePercent"),
        },
    )

    return {
        "symbol": symbol,
        "name": safe_get(info, "longName", symbol),
        "price": safe_get(info, "regularMarketPrice"),
        "change": safe_get(info, "regularMarketChangePercent"),
        "recommendation": recommendation,
        "news": {
            **news_summary,
            "headlines": [
                {
                    "title": article["title"],
                    "sentiment": article["sentiment"],
                }
                for article in articles
            ],
        },
        "aiAnalysis": ai_analysis,
    }


def main():
    parser = argparse.ArgumentParser(description="Mini AI Market Research Assistant CLI")
    parser.add_argument("symbols", nargs="+", help="Stock symbols such as AAPL MSFT GOOGL")
    args = parser.parse_args()

    output = [analyze_symbol(symbol.upper()) for symbol in args.symbols[:3]]
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
