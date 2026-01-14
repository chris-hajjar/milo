"use client";

import React, { useState } from "react";
import { useRenderToolCall } from "@copilotkit/react-core";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

interface Position {
  ticker: string;
  quantity: number;
  price: number;
  value: number;
  percentage: number;
  volatility: number;
}

export default function DashboardPositionTable() {
  const [positions, setPositions] = useState<Position[]>([]);

  useRenderToolCall({
    name: "analyze_portfolio_risk",
    render: ({ result, status }) => {
      if (status === "complete" && result && !result.error && result.positions) {
        setPositions(result.positions);
      }
      return null;
    },
  });

  if (positions.length === 0) {
    return (
      <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No positions to display. Analyze a portfolio first!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ boxShadow: 6, borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Position Breakdown
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell><strong>Ticker</strong></TableCell>
                <TableCell align="right"><strong>Quantity</strong></TableCell>
                <TableCell align="right"><strong>Price</strong></TableCell>
                <TableCell align="right"><strong>Value</strong></TableCell>
                <TableCell align="right"><strong>% Portfolio</strong></TableCell>
                <TableCell align="right"><strong>Volatility</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.ticker} hover>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="bold">
                      {position.ticker}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{position.quantity}</TableCell>
                  <TableCell align="right">${position.price.toFixed(2)}</TableCell>
                  <TableCell align="right">${position.value.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        color: position.percentage > 30 ? "#dc2626" : position.percentage > 20 ? "#f59e0b" : "#16a34a",
                        fontWeight: "medium",
                      }}
                    >
                      {position.percentage.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{position.volatility.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
