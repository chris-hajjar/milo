"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import DashboardTransactionSummary from "@/components/transactions/DashboardTransactionSummary";
import DashboardTransactionTable from "@/components/transactions/DashboardTransactionTable";
import DashboardTransactionChart from "@/components/transactions/DashboardTransactionChart";
import DashboardTransactionBreakdown from "@/components/transactions/DashboardTransactionBreakdown";
import { Box, Container, Typography } from "@mui/material";

export default function Transactions() {
  return (
    <>
      <CopilotSidebar
        defaultOpen={false}
        clickOutsideToClose={true}
        instructions="You are a transaction query assistant. Help users explore their transaction history with natural language queries. Use query_transactions to filter by timeframe, account type, transaction type, or ticker symbol. You can answer questions like 'show me all dividends in the last 90 days', 'RRSP deposits this year', or 'all AAPL transactions'."
        labels={{
          initial:
            "What transactions would you like to see?\n\nExamples:\n• Show me all dividends in the last 90 days\n• RRSP deposits this year\n• TFSA purchases in the last 30 days\n• All AAPL transactions\n• Fees in Q1 2026",
        }}
      />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#FAFAFA",
          padding: 3,
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <Typography
            variant="h3"
            sx={{
              fontSize: "32px",
              fontWeight: 600,
              color: "#1A1A1A",
              mb: 1,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Activity
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#6B6B6B",
              fontSize: "14px",
              mb: 4,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Query your transaction history with natural language
          </Typography>

          {/* Top Row: Summary and Breakdown */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              marginBottom: 3,
            }}
          >
            <DashboardTransactionSummary />
            <DashboardTransactionBreakdown />
          </Box>

          {/* Middle Row: Chart */}
          <Box sx={{ marginBottom: 3 }}>
            <DashboardTransactionChart />
          </Box>

          {/* Bottom Row: Transaction Table */}
          <Box>
            <DashboardTransactionTable />
          </Box>
        </Container>
      </Box>
    </>
  );
}
