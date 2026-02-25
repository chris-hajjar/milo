"use client";

import React, { useState, useEffect } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box, Divider } from "@mui/material";

interface TransactionSummary {
  query: string;
  filters: {
    start_date: string | null;
    end_date: string | null;
    account_type: string | null;
    transaction_types: string[];
    ticker: string | null;
  };
  summary: {
    total_amount: number;
    total_count: number;
    by_type: Record<string, { count: number; total: number }>;
    by_account: Record<string, { count: number; total: number }>;
  };
  timestamp: string;
}

export default function DashboardTransactionSummary() {
  const [data, setData] = useState<TransactionSummary | null>(null);
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
      setData(pendingResult as TransactionSummary);
      setPendingResult(null);
    }
  }, [pendingResult]);

  if (!data) {
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
            Query your transactions
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#898989",
              mt: 1,
              fontSize: "12px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Example: "Show me all dividends in the last 90 days"
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { summary } = data;
  const isPositive = summary.total_amount >= 0;

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
        {/* Header */}
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
          Transaction Summary
        </Typography>

        {/* Total Amount */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 700,
              color: isPositive ? "#16A34A" : "#DC2626",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            {isPositive ? "+" : ""}${Math.abs(summary.total_amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#898989",
              fontSize: "12px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Net Cash Flow
          </Typography>
        </Box>

        {/* Transaction Count */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#6B6B6B",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            {summary.total_count} transaction{summary.total_count !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#F0F0F0" }} />

        {/* By Account Breakdown */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: "#6B6B6B",
              fontSize: "12px",
              fontWeight: 500,
              mb: 1.5,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            By Account
          </Typography>
          {Object.entries(summary.by_account).map(([account, { count, total }]) => (
            <Box
              key={account}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#1A1A1A",
                  fontSize: "14px",
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                {account}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: total >= 0 ? "#16A34A" : "#DC2626",
                  fontSize: "14px",
                  fontWeight: 500,
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
          ))}
        </Box>

        <Divider sx={{ my: 2, borderColor: "#F0F0F0" }} />

        {/* Timestamp */}
        <Typography
          variant="caption"
          sx={{
            color: "#898989",
            fontSize: "11px",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
