"use client";

import React, { useState, useEffect } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";

interface TimeSeriesData {
  date: string;
  amount: number;
  count: number;
}

interface TransactionChartData {
  time_series: TimeSeriesData[];
}

export default function DashboardTransactionChart() {
  const [data, setData] = useState<TransactionChartData | null>(null);
  const [chartType, setChartType] = useState<"monthly" | "cumulative">("monthly");
  const [pendingResult, setPendingResult] = useState<any>(null);

  useRenderToolCall({
    name: "query_transactions",
    render: ({ result, status }) => {
      if (status === "complete" && result && !result.error) {
        setPendingResult(result);
      }
      return <></>;
    },
  });

  useEffect(() => {
    if (pendingResult) {
      setData(pendingResult as TransactionChartData);
      setPendingResult(null);
    }
  }, [pendingResult]);

  if (!data || data.time_series.length === 0) {
    return (
      <Card
        sx={{
          border: "1px solid #E5E5E5",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          height: "100%",
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Typography
            variant="h6"
            sx={{
              color: "#6B6B6B",
              fontWeight: 400,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            No chart data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleChartTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: "monthly" | "cumulative" | null
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  // Prepare data for charts
  const labels = data.time_series.map((d) => d.date);
  const amounts = data.time_series.map((d) => d.amount);

  // Calculate cumulative amounts
  const cumulativeAmounts = amounts.reduce((acc, amount, index) => {
    const cumulative = index === 0 ? amount : acc[index - 1] + amount;
    acc.push(cumulative);
    return acc;
  }, [] as number[]);

  return (
    <Card
      sx={{
        border: "1px solid #E5E5E5",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#1A1A1A",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Cash Flow Trend
          </Typography>

          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                fontSize: "12px",
                padding: "4px 12px",
                textTransform: "none",
                color: "#6B6B6B",
                border: "1px solid #E5E5E5",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                "&.Mui-selected": {
                  backgroundColor: "#F5F5F5",
                  color: "#1A1A1A",
                  fontWeight: 500,
                },
              },
            }}
          >
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="cumulative">Cumulative</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ height: 300, mt: 2 }}>
          {chartType === "monthly" ? (
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: labels,
                  tickLabelStyle: {
                    fontSize: 12,
                    fill: "#6B6B6B",
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  },
                },
              ]}
              yAxis={[
                {
                  tickLabelStyle: {
                    fontSize: 12,
                    fill: "#6B6B6B",
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  },
                },
              ]}
              series={[
                {
                  data: amounts,
                  color: "#16A34A",
                  label: "Net Flow",
                },
              ]}
              height={300}
              grid={{ horizontal: true }}
              sx={{
                "& .MuiChartsGrid-line": {
                  stroke: "#F0F0F0",
                },
              }}
            />
          ) : (
            <LineChart
              xAxis={[
                {
                  scaleType: "band",
                  data: labels,
                  tickLabelStyle: {
                    fontSize: 12,
                    fill: "#6B6B6B",
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  },
                },
              ]}
              yAxis={[
                {
                  tickLabelStyle: {
                    fontSize: 12,
                    fill: "#6B6B6B",
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  },
                },
              ]}
              series={[
                {
                  data: cumulativeAmounts,
                  color: "#2563EB",
                  label: "Cumulative",
                  curve: "linear",
                },
              ]}
              height={300}
              grid={{ horizontal: true }}
              sx={{
                "& .MuiChartsGrid-line": {
                  stroke: "#F0F0F0",
                },
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
