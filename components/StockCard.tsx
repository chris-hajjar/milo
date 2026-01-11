"use client";

import React from "react";
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
  // Render backend tool results with Generative UI pattern
  useCopilotAction({
    name: "get_stock_price",
    available: "disabled", // Only renders backend tool results
    parameters: [
      {
        name: "symbol",
        type: "string",
        required: true,
        description: "Stock ticker symbol",
      },
    ],
    render: ({ args, result, status }) => {
      console.log('Render called:', { args, result, status });
      console.log('Result keys:', result ? Object.keys(result) : 'null');
      console.log('Previous close value:', result?.previous_close, result?.previousClose);

      if (status !== "complete" || !result) {
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
              <Typography variant="h5" fontWeight="bold">
                {status === "executing" ? "⚙️ Loading stock data..." : "Ask about a stock!"}
              </Typography>
            </CardContent>
          </Card>
        );
      }

      const stockData: StockData = {
        ticker: args.symbol || "",
        price: result.price || 0,
        open: result.open || 0,
        high: result.high || 0,
        low: result.low || 0,
        volume: result.volume || 0,
        previousClose: result.previousClose || result.previous_close || 0,
      };

      return <StockCardDisplay data={stockData} />;
    },
  });

  // Return null when no stock data - card only appears when tool renders
  return null;
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
