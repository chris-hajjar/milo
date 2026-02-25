"use client";

import React, { useState, useEffect } from "react";
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
  Box,
} from "@mui/material";

interface Transaction {
  transaction_id: string;
  date: string;
  account_type: string;
  transaction_type: string;
  ticker: string | null;
  quantity: number | null;
  price: number | null;
  amount: number;
  description: string;
  currency: string;
}

interface TransactionData {
  transactions: Transaction[];
}

export default function DashboardTransactionTable() {
  const [data, setData] = useState<TransactionData | null>(null);
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
      setData(pendingResult as TransactionData);
      setPendingResult(null);
    }
  }, [pendingResult]);

  if (!data || data.transactions.length === 0) {
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
            No transactions to display
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Limit to most recent 50 transactions
  const displayTransactions = data.transactions.slice(0, 50);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
            mb: 2,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          Recent Transactions
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    borderBottom: "1px solid #F0F0F0",
                    color: "#6B6B6B",
                    fontSize: "12px",
                    fontWeight: 500,
                    pb: 1.5,
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "1px solid #F0F0F0",
                    color: "#6B6B6B",
                    fontSize: "12px",
                    fontWeight: 500,
                    pb: 1.5,
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "1px solid #F0F0F0",
                    color: "#6B6B6B",
                    fontSize: "12px",
                    fontWeight: 500,
                    pb: 1.5,
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  }}
                >
                  Description
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "1px solid #F0F0F0",
                    color: "#6B6B6B",
                    fontSize: "12px",
                    fontWeight: 500,
                    pb: 1.5,
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  }}
                >
                  Account
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    borderBottom: "1px solid #F0F0F0",
                    color: "#6B6B6B",
                    fontSize: "12px",
                    fontWeight: 500,
                    pb: 1.5,
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  }}
                >
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayTransactions.map((txn) => (
                <TableRow
                  key={txn.transaction_id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#FAFAFA",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #F0F0F0",
                      color: "#1A1A1A",
                      fontSize: "14px",
                      py: 1.5,
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {formatDate(txn.date)}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #F0F0F0",
                      fontSize: "14px",
                      py: 1.5,
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: getTypeColor(txn.transaction_type),
                        }}
                      />
                      <Typography
                        sx={{
                          color: "#6B6B6B",
                          fontSize: "14px",
                          textTransform: "capitalize",
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        {txn.transaction_type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #F0F0F0",
                      color: "#1A1A1A",
                      fontSize: "14px",
                      py: 1.5,
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {txn.ticker ? (
                      <Box>
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 500,
                            fontSize: "14px",
                            fontFamily:
                              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          }}
                        >
                          {txn.ticker}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            color: "#898989",
                            fontSize: "12px",
                            ml: 1,
                            fontFamily:
                              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          }}
                        >
                          {txn.description}
                        </Typography>
                      </Box>
                    ) : (
                      txn.description
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #F0F0F0",
                      color: "#6B6B6B",
                      fontSize: "14px",
                      py: 1.5,
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {txn.account_type}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      borderBottom: "1px solid #F0F0F0",
                      color: txn.amount >= 0 ? "#16A34A" : "#DC2626",
                      fontSize: "14px",
                      fontWeight: 500,
                      py: 1.5,
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {txn.amount >= 0 ? "+" : ""}${Math.abs(txn.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {data.transactions.length > 50 && (
          <Typography
            variant="caption"
            sx={{
              color: "#898989",
              fontSize: "11px",
              mt: 2,
              display: "block",
              textAlign: "center",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Showing 50 of {data.transactions.length} transactions
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
