"use client";

import React, { useState } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import { Card, CardContent, Typography, Alert, Box } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface RiskAlert {
  severity: string;
  metric: string;
  current: number;
  limit: number;
  percentage: number;
  unit: string;
  message: string;
}

export default function DashboardRiskAlerts() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);

  useRenderToolCall({
    name: "analyze_portfolio_risk",
    render: ({ result, status }) => {
      if (status === "complete" && result && !result.error && result.alerts) {
        setAlerts(result.alerts);
      }
      return null;
    },
  });

  return (
    <Card sx={{ boxShadow: 6, borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Risk Alerts
          </Typography>
        </Box>

        {alerts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: "#16a34a", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              All Clear!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No risk limits exceeded or approaching
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                severity={alert.severity === "red" ? "error" : "warning"}
                icon={alert.severity === "red" ? <ErrorIcon /> : <WarningIcon />}
                sx={{ borderRadius: 2 }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {alert.metric}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {alert.message}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  Current: {alert.current}{alert.unit} | Limit: {alert.limit}{alert.unit} ({alert.percentage}%)
                </Typography>
              </Alert>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
