"use client";

import React, { useState } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box, Divider, Chip } from "@mui/material";

interface PositionSizeData {
  ticker: string;
  current_price: number;
  current_portfolio_value: number;
  max_concentration_limit: number;
  max_position_value: number;
  max_shares: number;
  recommended_investment: number;
  resulting_concentration: number;
}

export default function DashboardPositionSizer() {
  const [sizeData, setSizeData] = useState<PositionSizeData | null>(null);

  useRenderToolCall({
    name: "calculate_optimal_position_size",
    render: ({ result, status }) => {
      if (status === "complete" && result && !result.error) {
        setSizeData(result as PositionSizeData);
      }
      return null;
    },
  });

  if (!sizeData) {
    return (
      <Card sx={{ boxShadow: 4, borderRadius: 3, height: "100%" }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Calculate optimal position sizes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Example: "How much TSLA can I buy without exceeding 20% concentration?"
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ boxShadow: 6, borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Position Size Calculator
          </Typography>
          <Chip
            label={sizeData.ticker}
            sx={{
              backgroundColor: "#2196f3",
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Box>

        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Recommended Purchase
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ color: "#16a34a" }}>
            {sizeData.max_shares} shares
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            ${sizeData.recommended_investment.toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Current Price
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              ${sizeData.current_price.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Portfolio Value
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              ${sizeData.current_portfolio_value.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Concentration Limit
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {sizeData.max_concentration_limit}%
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Resulting Concentration
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{
                color:
                  sizeData.resulting_concentration > sizeData.max_concentration_limit
                    ? "#dc2626"
                    : "#16a34a",
              }}
            >
              {sizeData.resulting_concentration.toFixed(2)}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
