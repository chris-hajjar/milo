"use client";

import React, { useState } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box, Divider, Chip } from "@mui/material";

interface StockData {
  ticker: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
}

export default function DashboardStockCard() {
  const [stockData, setStockData] = useState<StockData | null>(null);

  // Listen for tool calls and capture data
  useRenderToolCall({
    name: "get_stock_price",
    render: ({ args, result, status }) => {
      if (status === "complete" && result) {
        const data: StockData = {
          ticker: args.symbol || "",
          price: result.price || 0,
          open: result.open || 0,
          high: result.high || 0,
          low: result.low || 0,
          volume: result.volume || 0,
          previousClose: result.previousClose || result.previous_close || 0,
        };
        setStockData(data);
      }
      // Return null so nothing renders in the chat
      return null;
    },
  });

  // Always render the card in the dashboard
  if (!stockData) {
    return (
      <Card
        sx={{
          width: "100%",
          boxShadow: 4,
          borderRadius: 3,
          height: "100%",
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h5" fontWeight="bold" color="text.secondary">
            Ask about a stock!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Render with data
  const price = typeof stockData.price === 'number' ? stockData.price : 0;
  const previousClose = typeof stockData.previousClose === 'number' ? stockData.previousClose : price;
  const open = typeof stockData.open === 'number' ? stockData.open : 0;
  const high = typeof stockData.high === 'number' ? stockData.high : 0;
  const low = typeof stockData.low === 'number' ? stockData.low : 0;
  const volume = typeof stockData.volume === 'number' ? stockData.volume : 0;

  const priceChange = price - previousClose;
  const priceChangePercent = previousClose > 0 ? (priceChange / previousClose) * 100 : 0;
  const isPriceUp = priceChange >= 0;
  const priceColor = isPriceUp ? "#16a34a" : "#dc2626";

  return (
    <Card
      sx={{
        width: "100%",
        boxShadow: 6,
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Ticker Label */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Chip
            label={stockData.ticker}
            sx={{
              backgroundColor: "#2196f3",
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              padding: "4px 8px",
              height: "auto",
            }}
          />
        </Box>

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
