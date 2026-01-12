"use client";

import React, { useState } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

interface CandleData {
  date: number;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

interface PriceHistory {
  symbol: string;
  range: string;
  interval: string;
  prices: CandleData[];
}

export default function DashboardPriceChart() {
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);

  // Listen for tool calls and capture data
  useRenderToolCall({
    name: "get_price_history",
    render: ({ args, result, status }) => {
      if (status === "complete" && result) {
        const data: PriceHistory = {
          symbol: args.symbol || "",
          range: args.period || "1mo",
          interval: args.interval || "1d",
          prices: Array.isArray(result) ? result : [],
        };
        setPriceHistory(data);
      }
      // Return null so nothing renders in the chat
      return null;
    },
  });

  // Always render the card in the dashboard
  if (!priceHistory) {
    return (
      <Card sx={{ width: "100%", boxShadow: 4, borderRadius: 3, height: "100%" }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h5" fontWeight="bold" color="text.secondary">
            Ask about price history!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Filter out null values
  const validPrices = priceHistory.prices.filter((p) => p.close !== null && p.date !== null);

  if (validPrices.length === 0) {
    return (
      <Card sx={{ width: "100%", boxShadow: 4, borderRadius: 3, height: "100%" }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="error">
            No valid price data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Convert timestamps to Date objects and extract close prices
  const dates = validPrices.map((p) => new Date(p.date * 1000));
  const closePrices = validPrices.map((p) => p.close!);

  // Calculate overall change
  const firstClose = closePrices[0];
  const lastClose = closePrices[closePrices.length - 1];
  const priceChange = lastClose - firstClose;
  const priceChangePercent = (priceChange / firstClose) * 100;
  const isPriceUp = priceChange >= 0;
  const changeColor = isPriceUp ? "#16a34a" : "#dc2626";
  const lineColor = isPriceUp ? "#16a34a" : "#dc2626";

  return (
    <Card sx={{ width: "100%", boxShadow: 6, borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Ticker Label */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Chip
            label={priceHistory.symbol}
            sx={{
              backgroundColor: "#4caf50",
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              padding: "4px 8px",
              height: "auto",
            }}
          />
        </Box>

        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="h6" fontWeight="bold" color="text.secondary">
              Price History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {priceHistory.range} • {priceHistory.interval}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <Typography variant="h4" fontWeight="bold">
              ${lastClose.toFixed(2)}
            </Typography>
            <Typography variant="h6" sx={{ color: changeColor }}>
              {isPriceUp ? "▲" : "▼"} ${Math.abs(priceChange).toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </Typography>
          </Box>
        </Box>

        {/* Price Chart */}
        <Box sx={{ width: "100%", height: 400 }}>
          <LineChart
            xAxis={[
              {
                data: dates,
                scaleType: "time",
                valueFormatter: (date: Date) => {
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                },
              },
            ]}
            yAxis={[
              {
                valueFormatter: (value: number) => `$${value.toFixed(2)}`,
              },
            ]}
            series={[
              {
                data: closePrices,
                label: "Price",
                color: lineColor,
                showMark: false,
                curve: "linear",
                area: true,
              },
            ]}
            height={400}
            margin={{ top: 20, right: 30, bottom: 50, left: 70 }}
            grid={{ horizontal: true }}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
            sx={{
              "& .MuiLineElement-root": {
                strokeWidth: 2,
              },
              "& .MuiAreaElement-root": {
                fillOpacity: 0.1,
              },
            }}
          />
        </Box>

        {/* Source */}
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
          Source: Yahoo Finance
        </Typography>
      </CardContent>
    </Card>
  );
}
