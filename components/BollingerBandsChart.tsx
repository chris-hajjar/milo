"use client";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

interface CandleData {
  date: number;
  close: number | null;
}

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
  prices: CandleData[];
  bands: BollingerBand[];
}

export default function BollingerBandsChart() {
  useRenderToolCall({
    name: "get_technical_indicators",
    render: ({ args, result, status }) => {
      if (status !== "complete" || !result) {
        return (
          <Card sx={{ maxWidth: 900, width: "100%", mx: 4, boxShadow: 4, borderRadius: 3 }}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h5" fontWeight="bold">
                {status === "executing" ? "📊 Loading Bollinger Bands..." : "Ask about Bollinger Bands!"}
              </Typography>
            </CardContent>
          </Card>
        );
      }

      // Check if result has bollinger bands data
      if (!result.bollinger_data || !Array.isArray(result.bollinger_data)) {
        return null; // Don't render if no bollinger data
      }

      const bollingerData: BollingerBandsData = {
        symbol: result.symbol || args.symbol || "",
        period: result.period || args.period || "1mo",
        interval: result.interval || args.interval || "1d",
        prices: result.prices || [],
        bands: result.bollinger_data || [],
      };

      return <BollingerBandsDisplay data={bollingerData} />;
    },
  });

  return null; // Chart only appears when tool renders
}

function BollingerBandsDisplay({ data }: { data: BollingerBandsData }) {
  if (data.bands.length === 0) {
    return (
      <Card sx={{ maxWidth: 900, width: "100%", mx: 4, boxShadow: 4, borderRadius: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="error">
            No valid Bollinger Bands data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Convert timestamps to Date objects
  const dates = data.bands.map((b) => new Date(b.date * 1000));
  const upperBand = data.bands.map((b) => b.upper);
  const middleBand = data.bands.map((b) => b.middle);
  const lowerBand = data.bands.map((b) => b.lower);
  const closePrices = data.bands.map((b) => b.close);

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
    <Card sx={{ maxWidth: 900, width: "100%", mx: 4, boxShadow: 6, borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              {data.symbol} - Bollinger Bands
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.period} • {data.interval}
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
                valueFormatter: (value: number) => `$${value.toFixed(2)}`,
              },
            ]}
            series={[
              {
                data: upperBand,
                label: "Upper Band",
                color: "#94a3b8",
                showMark: false,
                curve: "linear",
                strokeWidth: 1.5,
              },
              {
                data: middleBand,
                label: "Middle Band (SMA)",
                color: "#475569",
                showMark: false,
                curve: "linear",
                strokeWidth: 2,
              },
              {
                data: lowerBand,
                label: "Lower Band",
                color: "#94a3b8",
                showMark: false,
                curve: "linear",
                strokeWidth: 1.5,
              },
              {
                data: closePrices,
                label: "Price",
                color: statusColor,
                showMark: false,
                curve: "linear",
                strokeWidth: 2.5,
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
              "& .MuiLineElement-root": {
                strokeWidth: 2,
              },
              // Add shaded area between bands using background
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
