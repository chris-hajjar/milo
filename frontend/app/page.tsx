"use client";
import React, { useState } from "react";
import "@copilotkit/react-ui/styles.css";
import { CopilotKit, useCopilotAction } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

export default function YahooFinanceChat() {
  return (
    <CopilotKit
      runtimeUrl="http://127.0.0.1:8000"
      showDevConsole={false}
      agent="yahoo_finance_agent"
    >
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "Yahoo Finance Assistant",
          initial: "Ask me about stock prices, news, or market data! 📈",
        }}
        clickOutsideToClose={false}
        suggestions={[
          { title: "Stock Price", message: "What's the price of Apple?" },
          { title: "Recent News", message: "Get me news about Tesla" },
          { title: "Price History", message: "Show NVDA price history for 1 month" },
          { title: "Search Stocks", message: "Find stocks for Microsoft" },
        ]}
      />
      <StockDisplay />
    </CopilotKit>
  );
}

interface StockData {
  ticker: string;
  price: number;
  currency: string;
  change: number;
  company: string;
}

function StockDisplay() {
  const [stocks, setStocks] = useState<StockData[]>([]);

  useCopilotAction(
    {
      name: "display_stock_card",
      parameters: [
        {
          name: "ticker",
          type: "string",
          required: true,
          description: "Stock ticker symbol (e.g., AAPL, TSLA)",
        },
        {
          name: "company",
          type: "string",
          required: true,
          description: "Company name",
        },
        {
          name: "price",
          type: "number",
          required: true,
          description: "Current stock price",
        },
        {
          name: "currency",
          type: "string",
          required: true,
          description: "Currency (e.g., USD)",
        },
        {
          name: "change",
          type: "number",
          required: true,
          description: "Price change percentage",
        },
      ],
      followUp: false,
      handler: async ({ ticker, company, price, currency, change }) => {
        const newStock: StockData = {
          ticker: ticker || "N/A",
          company: company || "Unknown",
          price: price || 0,
          currency: currency || "USD",
          change: change || 0,
        };
        setStocks((prev) => [newStock, ...prev].slice(0, 5)); // Keep last 5 stocks
        return `Stock card displayed for ${ticker}`;
      },
      render: ({ args }) => {
        if (!args.ticker) return <></>;
        return <StockCard stock={args as StockData} />;
      },
    },
    [stocks]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Yahoo Finance AI Assistant
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Ask questions about stocks, get real-time data, news, and analysis
          </p>
        </div>

        {stocks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Recent Stock Queries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stocks.map((stock, index) => (
                <StockCard key={index} stock={stock} />
              ))}
            </div>
          </div>
        )}

        {stocks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Open the chat sidebar to start asking about stocks!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StockCard({ stock }: { stock: Partial<StockData> }) {
  const isPositive = (stock.change ?? 0) >= 0;

  return (
    <div
      data-testid="stock-card"
      className="relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Decorative gradient background */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${
          isPositive
            ? "bg-gradient-to-br from-green-400/10 to-emerald-400/10"
            : "bg-gradient-to-br from-red-400/10 to-rose-400/10"
        } rounded-full blur-3xl -z-0`}
      />

      <div className="relative z-10">
        {/* Ticker and Company */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stock.ticker || "N/A"}
            </h3>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {isPositive ? "↑" : "↓"} {Math.abs(stock.change ?? 0).toFixed(2)}%
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {stock.company || "Unknown Company"}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {stock.currency} {stock.price?.toFixed(2) ?? "0.00"}
          </span>
        </div>

        {/* Visual indicator */}
        <div className="mt-4 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              isPositive ? "bg-green-500" : "bg-red-500"
            } transition-all duration-500`}
            style={{ width: `${Math.min(Math.abs(stock.change ?? 0) * 10, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
