"use client";

import React, { useState, useEffect } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box, LinearProgress } from "@mui/material";

interface BreakdownData {
  summary: {
    by_type: Record<string, { count: number; total: number }>;
  };
}

export default function DashboardTransactionBreakdown() {
  const [data, setData] = useState<BreakdownData | null>(null);
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
      setData(pendingResult as BreakdownData);
      setPendingResult(null);
    }
  }, [pendingResult]);

  if (!data || Object.keys(data.summary.by_type).length === 0) {
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
            No breakdown data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const byType = data.summary.by_type;

  // Calculate total absolute value for percentage calculation
  const totalAbsolute = Object.values(byType).reduce(
    (sum, { total }) => sum + Math.abs(total),
    0
  );

  // Sort by absolute total (descending)
  const sortedTypes = Object.entries(byType).sort(
    ([, a], [, b]) => Math.abs(b.total) - Math.abs(a.total)
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "dividend":
      case "deposit":
      case "interest":
        return "#16A34A";
      case "sale":
        return "#2563EB";
      case "withdrawal":
      case "purchase":
      case "fee":
        return "#DC2626";
      default:
        return "#6B6B6B";
    }
  };

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
        <Typography
          variant="h6"
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#1A1A1A",
            mb: 3,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          Transaction Breakdown
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {sortedTypes.map(([type, { count, total }]) => {
            const percentage = (Math.abs(total) / totalAbsolute) * 100;

            return (
              <Box key={type}>
                {/* Type Name and Amount */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: getTypeColor(type),
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1A1A1A",
                        textTransform: "capitalize",
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      {type}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#898989",
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      ({count})
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: total >= 0 ? "#16A34A" : "#DC2626",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {total >= 0 ? "+" : ""}${Math.abs(total).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#F5F5F5",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getTypeColor(type),
                      borderRadius: 3,
                    },
                  }}
                />

                {/* Percentage */}
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "#898989",
                    mt: 0.5,
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  }}
                >
                  {percentage.toFixed(1)}% of total activity
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
