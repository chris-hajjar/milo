"use client";

import React, { useState } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box, Chip, Divider } from "@mui/material";

interface PortfolioData {
  portfolio_value: number;
  num_holdings: number;
  portfolio_volatility: number;
  var_95: number;
  max_concentration: number;
  timestamp: string;
}

export default function DashboardPortfolioSummary() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  // Listen for analyze_portfolio_risk tool calls
  useRenderToolCall({
    name: "analyze_portfolio_risk",
    render: ({ result, status }) => {
      if (status === "complete" && result && !result.error) {
        setPortfolioData(result as PortfolioData);
      }
      return null;
    },
  });

  if (!portfolioData) {
    return (
      <Card sx={{ boxShadow: 4, borderRadius: 3, height: "100%" }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h5" fontWeight="bold" color="text.secondary">
            Analyze your portfolio!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Example: "Analyze my portfolio: 100 AAPL, 50 MSFT, 25 GOOGL"
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ boxShadow: 6, borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Portfolio Overview
          </Typography>
          <Chip
            label={`${portfolioData.num_holdings} Holdings`}
            sx={{
              backgroundColor: "#2196f3",
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Box>

        {/* Portfolio Value */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h2" fontWeight="bold" sx={{ color: "#2196f3", fontSize: "3rem" }}>
            ${portfolioData.portfolio_value.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Portfolio Value
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Risk Metrics */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Portfolio Volatility (Annual)
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {portfolioData.portfolio_volatility.toFixed(2)}%
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Value at Risk (95%, 1-day)
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              ${portfolioData.var_95.toLocaleString()}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Max Position Concentration
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {portfolioData.max_concentration.toFixed(2)}%
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Timestamp */}
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(portfolioData.timestamp).toLocaleTimeString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
