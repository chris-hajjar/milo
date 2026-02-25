"use client";

import React, { useState, useEffect } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Box, Divider, Grid } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface ScenarioData {
  name: string;
  portfolio_value: number;
  portfolio_volatility: number;
  var_95: number;
  max_concentration: number;
}

interface ComparisonData {
  scenario_a: ScenarioData;
  scenario_b: ScenarioData;
  comparison: {
    value_change: number;
    volatility_change: number;
    var_change: number;
  };
}

export default function DashboardScenarioComparison() {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [pendingResult, setPendingResult] = useState<any>(null);

  useRenderToolCall({
    name: "compare_portfolio_scenarios",
    render: ({ result, status }) => {
      if (status === "complete" && result) {
        setPendingResult(result);
      }
      return <></>;
    },
  });

  useEffect(() => {
    if (pendingResult) {
      setComparisonData(pendingResult as ComparisonData);
      setPendingResult(null);
    }
  }, [pendingResult]);

  if (!comparisonData) {
    return (
      <Card sx={{ boxShadow: 4, borderRadius: 3, height: "100%" }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Compare portfolio scenarios with "what if" analysis
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { scenario_a, scenario_b, comparison } = comparisonData;

  return (
    <Card sx={{ boxShadow: 6, borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Scenario Comparison
        </Typography>

        <Grid container spacing={3}>
          {/* Scenario A */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {scenario_a.name}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Portfolio Value
                  </Typography>
                  <Typography variant="h6">
                    ${scenario_a.portfolio_value.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Volatility
                  </Typography>
                  <Typography variant="h6">
                    {scenario_a.portfolio_volatility.toFixed(2)}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    VaR (95%)
                  </Typography>
                  <Typography variant="h6">
                    ${scenario_a.var_95.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Scenario B */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {scenario_b.name}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Portfolio Value
                  </Typography>
                  <Typography variant="h6">
                    ${scenario_b.portfolio_value.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Volatility
                  </Typography>
                  <Typography variant="h6">
                    {scenario_b.portfolio_volatility.toFixed(2)}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    VaR (95%)
                  </Typography>
                  <Typography variant="h6">
                    ${scenario_b.var_95.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Changes */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Changes ({scenario_b.name} vs {scenario_a.name})
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Value Change
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {comparison.value_change >= 0 ? (
                <TrendingUpIcon sx={{ color: "#16a34a" }} />
              ) : (
                <TrendingDownIcon sx={{ color: "#dc2626" }} />
              )}
              <Typography
                variant="body1"
                fontWeight="bold"
                sx={{ color: comparison.value_change >= 0 ? "#16a34a" : "#dc2626" }}
              >
                ${Math.abs(comparison.value_change).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Volatility Change
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {comparison.volatility_change >= 0 ? (
                <TrendingUpIcon sx={{ color: "#dc2626" }} />
              ) : (
                <TrendingDownIcon sx={{ color: "#16a34a" }} />
              )}
              <Typography
                variant="body1"
                fontWeight="bold"
                sx={{ color: comparison.volatility_change >= 0 ? "#dc2626" : "#16a34a" }}
              >
                {Math.abs(comparison.volatility_change).toFixed(2)}%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              VaR Change
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {comparison.var_change >= 0 ? (
                <TrendingUpIcon sx={{ color: "#dc2626" }} />
              ) : (
                <TrendingDownIcon sx={{ color: "#16a34a" }} />
              )}
              <Typography
                variant="body1"
                fontWeight="bold"
                sx={{ color: comparison.var_change >= 0 ? "#dc2626" : "#16a34a" }}
              >
                ${Math.abs(comparison.var_change).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
