"use client";

import React, { useState } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box, Divider } from "@mui/material";

interface StockData {
  ticker: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
}

export default function StockCard() {
  const [stockData, setStockData] = useState<StockData | null>(null);

  useCopilotAction(
    {
      name: "update_stock_card",
      description: "Updates the stock price card with current market data for a given ticker symbol",
      parameters: [
        {
          name: "ticker",
          type: "string",
          required: true,
          description: "Stock ticker symbol (e.g., AAPL, TSLA, NVDA)",
        },
        {
          name: "price",
          type: "number",
          required: true,
          description: "Current stock price",
        },
        {
          name: "open",
          type: "number",
          required: true,
          description: "Opening price",
        },
        {
          name: "high",
          type: "number",
          required: true,
          description: "Day's high price",
        },
        {
          name: "low",
          type: "number",
          required: true,
          description: "Day's low price",
        },
        {
          name: "volume",
          type: "number",
          required: true,
          description: "Trading volume",
        },
        {
          name: "previousClose",
          type: "number",
          required: true,
          description: "Previous closing price",
        },
      ],
      handler: async ({ ticker, price, open, high, low, volume, previousClose }) => {
        console.log('update_stock_card called with:', { ticker, price, open, high, low, volume, previousClose });

        const newStockData: StockData = {
          ticker: ticker || "",
          price: price || 0,
          open: open || 0,
          high: high || 0,
          low: low || 0,
          volume: volume || 0,
          previousClose: previousClose || 0,
        };
        setStockData(newStockData);
        return `Stock card updated with ${ticker} data!`;
      },
      render: ({ args }) => {
        console.log('Render called with args:', args);
        if (!args.ticker) {
          console.log('No ticker in args, returning empty');
          return <></>;
        }
        return <StockCardDisplay data={args as StockData} />;
      },
    },
    []
  );

  if (!stockData) {
    return (
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          mx: 4,
          boxShadow: 4,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              borderRadius: "50%",
              mb: 3,
            }}
          >
            <svg
              style={{ width: 32, height: 32, color: "white" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Stock Information
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Ask about a stock in the sidebar
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Try asking:
          </Typography>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              sx={{
                bgcolor: "primary.50",
                borderRadius: 2,
                px: 2,
                py: 1,
                color: "primary.main",
              }}
            >
              "What's the price of AAPL?"
            </Box>
            <Box
              sx={{
                bgcolor: "secondary.50",
                borderRadius: 2,
                px: 2,
                py: 1,
                color: "secondary.main",
              }}
            >
              "Show me Tesla stock"
            </Box>
            <Box
              sx={{
                bgcolor: "info.50",
                borderRadius: 2,
                px: 2,
                py: 1,
                color: "info.main",
              }}
            >
              "Get NVDA stock price"
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return <StockCardDisplay data={stockData} />;
}

function StockCardDisplay({ data }: { data: StockData }) {
  // Safety check: ensure all numeric fields are valid numbers
  const price = typeof data.price === 'number' ? data.price : 0;
  const previousClose = typeof data.previousClose === 'number' ? data.previousClose : price;
  const open = typeof data.open === 'number' ? data.open : 0;
  const high = typeof data.high === 'number' ? data.high : 0;
  const low = typeof data.low === 'number' ? data.low : 0;
  const volume = typeof data.volume === 'number' ? data.volume : 0;

  const priceChange = price - previousClose;
  const priceChangePercent = previousClose > 0 ? (priceChange / previousClose) * 100 : 0;
  const isPriceUp = priceChange >= 0;
  const priceColor = isPriceUp ? "#16a34a" : "#dc2626"; // green-600 : red-600

  return (
    <Card
      sx={{
        maxWidth: 500,
        width: "100%",
        mx: 4,
        boxShadow: 6,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Ticker Symbol */}
        <Typography
          variant="h5"
          fontWeight="bold"
          color="text.secondary"
          gutterBottom
          sx={{ textAlign: "center", mb: 3 }}
        >
          {data.ticker}
        </Typography>

        {/* Current Price - Large and Bold */}
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{ color: priceColor, fontSize: "3.5rem" }}
          >
            ${price.toFixed(2)}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: priceColor, mt: 1 }}
          >
            {isPriceUp ? "▲" : "▼"} ${Math.abs(priceChange).toFixed(2)} (
            {priceChangePercent.toFixed(2)}%)
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Stock Details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Open
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              ${open.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              High
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              ${high.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Low
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              ${low.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Volume
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {volume.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Previous Close
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              ${previousClose.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
