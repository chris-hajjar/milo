"use client";

import React, { useState } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

interface BollingerBand {
  date: number;
  upper: number;
  middle: number;
  lower: number;
  close: number;
}

interface BollingerBandsData {
  symbol: string;
  period: string;
  interval: string;
  bands: BollingerBand[];
}

export default function DashboardBollingerBandsChart() {
  const [bollingerData, setBollingerData] = useState<BollingerBandsData | null>(null);

  // Listen for tool calls and capture data
  useRenderToolCall({
    name: "get_technical_indicators",
    render: ({ args, result, status }) => {
      if (status === "complete" && result) {
        // Check if result has bollinger bands data
        if (!result.bollinger_data || !Array.isArray(result.bollinger_data)) {
          return null;
        }

        const data: BollingerBandsData = {
          symbol: result.symbol || args.symbol || "",
          period: result.period || args.period || "1mo",
          interval: result.interval || args.interval || "1d",
          bands: result.bollinger_data || [],
        };
        setBollingerData(data);
      }
      // Return null so nothing renders in the chat
      return null;
    },
  });

  // Always render the card in the dashboard
  if (!bollingerData) {
    return (
      <Card sx={{ width: "100%", boxShadow: 4, borderRadius: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h5" fontWeight="bold" color="text.secondary">
            Ask about Bollinger Bands!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (bollingerData.bands.length === 0) {
    return (
      <Card sx={{ width: "100%", boxShadow: 4, borderRadius: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="error">
            No valid Bollinger Bands data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Convert timestamps to Date objects
  const dates = bollingerData.bands.map((b) => new Date(b.date * 1000));
  const upperBand = bollingerData.bands.map((b) => b.upper);
  const middleBand = bollingerData.bands.map((b) => b.middle);
  const lowerBand = bollingerData.bands.map((b) => b.lower);
  const closePrices = bollingerData.bands.map((b) => b.close);

  // Calculate min/max for proper chart scaling with padding
  const allValues = [...upperBand, ...middleBand, ...lowerBand, ...closePrices];
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;
  const padding = range * 0.05; // 5% padding

  // Get current values (last point)
  const currentClose = closePrices[closePrices.length - 1];
  const currentUpper = upperBand[upperBand.length - 1];
  const currentLower = lowerBand[lowerBand.length - 1];
  const currentMiddle = middleBand[middleBand.length - 1];

  // Determine price position and color
  let priceStatus = "Normal";
  let statusColor = "#6b7280"; // neutral gray

  if (currentClose >= currentUpper) {
    priceStatus = "Overbought";
    statusColor = "#dc2626"; // red
  } else if (currentClose <= currentLower) {
    priceStatus = "Oversold";
    statusColor = "#16a34a"; // green
  }

  // Calculate overall change
  const firstClose = closePrices[0];
  const lastClose = closePrices[closePrices.length - 1];
  const priceChange = lastClose - firstClose;
  const priceChangePercent = (priceChange / firstClose) * 100;
  const isPriceUp = priceChange >= 0;

  return (
    <Card sx={{ width: "100%", boxShadow: 6, borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Ticker Label */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Chip
            label={bollingerData.symbol}
            sx={{
              backgroundColor: "#9c27b0",
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
              Bollinger Bands
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {bollingerData.period} • {bollingerData.interval}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 1 }}>
            <Typography variant="h4" fontWeight="bold">
              ${lastClose.toFixed(2)}
            </Typography>
            <Typography variant="h6" sx={{ color: isPriceUp ? "#16a34a" : "#dc2626" }}>
              {isPriceUp ? "▲" : "▼"} ${Math.abs(priceChange).toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1" fontWeight="medium">
              Status:
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              sx={{
                color: statusColor,
                bgcolor: `${statusColor}15`,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {priceStatus}
            </Typography>
          </Box>
        </Box>

        {/* Bollinger Bands Chart */}
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
                min: minValue - padding,
                max: maxValue + padding,
                valueFormatter: (value: number) => `$${value.toFixed(2)}`,
              },
            ]}
            series={[
              {
                data: upperBand,
                label: "Upper Band",
                color: "#3b82f6",
                showMark: false,
                curve: "linear",
                strokeWidth: 2,
              },
              {
                data: middleBand,
                label: "Middle Band (SMA)",
                color: "#f59e0b",
                showMark: false,
                curve: "linear",
                strokeWidth: 2.5,
              },
              {
                data: lowerBand,
                label: "Lower Band",
                color: "#8b5cf6",
                showMark: false,
                curve: "linear",
                strokeWidth: 2,
              },
              {
                data: closePrices,
                label: "Price",
                color: statusColor,
                showMark: false,
                curve: "linear",
                strokeWidth: 3,
                area: false,
              },
            ]}
            height={400}
            margin={{ top: 20, right: 30, bottom: 50, left: 70 }}
            grid={{ horizontal: true }}
            slotProps={{
              legend: {
                direction: "row",
                position: { vertical: "top", horizontal: "middle" },
                padding: 0,
              },
            }}
            sx={{
              "& .MuiChartsAxis-root": {
                strokeWidth: 0.5,
              },
            }}
          />
        </Box>

        {/* Band Values */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-around", gap: 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Upper Band
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              ${currentUpper.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Middle Band (SMA)
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              ${currentMiddle.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Lower Band
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              ${currentLower.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Source */}
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
          Source: Yahoo Finance • 20-period SMA with 2 standard deviations
        </Typography>
      </CardContent>
    </Card>
  );
}
