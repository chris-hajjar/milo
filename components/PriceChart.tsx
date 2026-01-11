"use client";
import { useCopilotAction } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
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

export default function PriceChart() {
  useCopilotAction({
    name: "get_price_history",
    available: "disabled", // Only renders backend tool results
    parameters: [
      {
        name: "symbol",
        type: "string",
        required: true,
        description: "Stock ticker symbol",
      },
      {
        name: "period",
        type: "string",
        required: false,
        description: "Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)",
      },
      {
        name: "interval",
        type: "string",
        required: false,
        description: "Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)",
      },
    ],
    render: ({ args, result, status }) => {
      if (status !== "complete" || !result) {
        return (
          <Card sx={{ maxWidth: 900, width: "100%", mx: 4, boxShadow: 4, borderRadius: 3 }}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h5" fontWeight="bold">
                {status === "executing" ? "📊 Loading price history..." : "Ask about price history!"}
              </Typography>
            </CardContent>
          </Card>
        );
      }

      const priceHistory: PriceHistory = {
        symbol: result.symbol || args.symbol || "",
        range: result.range || args.period || "1mo",
        interval: result.interval || args.interval || "1d",
        prices: result.prices || [],
      };

      return <PriceChartDisplay data={priceHistory} />;
    },
  });

  return null; // Chart only appears when tool renders
}

function PriceChartDisplay({ data }: { data: PriceHistory }) {
  // Filter out null values and format data
  const validPrices = data.prices.filter(
    (p) => p.open !== null && p.high !== null && p.low !== null && p.close !== null && p.volume !== null
  );

  if (validPrices.length === 0) {
    return (
      <Card sx={{ maxWidth: 900, width: "100%", mx: 4, boxShadow: 4, borderRadius: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="error">
            No valid price data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Format dates for x-axis
  const xLabels = validPrices.map((p) => {
    const date = new Date(p.date * 1000);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  // Extract OHLC data
  const openPrices = validPrices.map((p) => p.open!);
  const highPrices = validPrices.map((p) => p.high!);
  const lowPrices = validPrices.map((p) => p.low!);
  const closePrices = validPrices.map((p) => p.close!);
  const volumes = validPrices.map((p) => p.volume!);

  // Calculate candlestick bodies (difference between open and close)
  const candleBodies = validPrices.map((p) => Math.abs(p.close! - p.open!));
  const bodyBases = validPrices.map((p) => Math.min(p.open!, p.close!));

  // Determine colors (green if close > open, red otherwise)
  const candleColors = validPrices.map((p) => (p.close! >= p.open! ? "#16a34a" : "#dc2626"));

  // Calculate wicks (high-low range)
  const wickRanges = validPrices.map((p, i) => ({
    low: p.low!,
    high: p.high!,
    base: bodyBases[i],
    body: candleBodies[i],
  }));

  // Get first and last close for overall change
  const firstClose = closePrices[0];
  const lastClose = closePrices[closePrices.length - 1];
  const priceChange = lastClose - firstClose;
  const priceChangePercent = (priceChange / firstClose) * 100;
  const isPriceUp = priceChange >= 0;
  const changeColor = isPriceUp ? "#16a34a" : "#dc2626";

  return (
    <Card sx={{ maxWidth: 900, width: "100%", mx: 4, boxShadow: 6, borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ display: "inline-block" }}>
            {data.symbol}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2, display: "inline-block" }}>
            {data.range} • {data.interval} interval
          </Typography>
          <Typography variant="h6" sx={{ color: changeColor, mt: 1 }}>
            {isPriceUp ? "▲" : "▼"} ${Math.abs(priceChange).toFixed(2)} ({priceChangePercent.toFixed(2)}%)
          </Typography>
        </Box>

        {/* Candlestick Chart */}
        <Box sx={{ width: "100%", height: 350, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Price (OHLC)
          </Typography>
          <LineChart
            xAxis={[
              {
                data: Array.from({ length: xLabels.length }, (_, i) => i),
                scaleType: "point",
                valueFormatter: (value) => xLabels[value],
              },
            ]}
            series={[
              {
                data: highPrices,
                label: "High",
                color: "#94a3b8",
                curve: "linear",
                showMark: false,
              },
              {
                data: lowPrices,
                label: "Low",
                color: "#cbd5e1",
                curve: "linear",
                showMark: false,
              },
              {
                data: closePrices,
                label: "Close",
                color: "#3b82f6",
                curve: "linear",
                showMark: true,
              },
            ]}
            height={300}
            margin={{ top: 10, right: 20, bottom: 30, left: 60 }}
            slotProps={{
              legend: {
                direction: "row",
                position: { vertical: "top", horizontal: "middle" },
                padding: 0,
              },
            }}
          />
        </Box>

        {/* Volume Chart */}
        <Box sx={{ width: "100%", height: 200 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Volume
          </Typography>
          <BarChart
            xAxis={[
              {
                data: Array.from({ length: xLabels.length }, (_, i) => i),
                scaleType: "band",
                valueFormatter: (value) => xLabels[value],
              },
            ]}
            series={[
              {
                data: volumes,
                label: "Volume",
                color: "#8b5cf6",
              },
            ]}
            height={150}
            margin={{ top: 10, right: 20, bottom: 30, left: 60 }}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
          />
        </Box>

        {/* Summary Stats */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mt: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Current
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              ${lastClose.toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              High
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              ${Math.max(...highPrices).toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Low
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              ${Math.min(...lowPrices).toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Avg Volume
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {(volumes.reduce((a, b) => a + b, 0) / volumes.length / 1000000).toFixed(2)}M
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
