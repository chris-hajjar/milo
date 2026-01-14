"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import DashboardPortfolioSummary from "@/components/risk/DashboardPortfolioSummary";
import DashboardRiskAlerts from "@/components/risk/DashboardRiskAlerts";
import DashboardPositionTable from "@/components/risk/DashboardPositionTable";
import DashboardScenarioComparison from "@/components/risk/DashboardScenarioComparison";
import DashboardPositionSizer from "@/components/risk/DashboardPositionSizer";
import { Box, Container, Typography } from "@mui/material";

export default function RiskMonitor() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="copilotkit_agent"
    >
      <CopilotSidebar
        defaultOpen={true}
        clickOutsideToClose={false}
        instructions="You are a portfolio risk analyst. Help users analyze their stock portfolios, calculate risk metrics like volatility and Value at Risk, compare scenarios, and determine optimal position sizes. Use analyze_portfolio_risk for comprehensive portfolio analysis, compare_portfolio_scenarios for what-if analysis, and calculate_optimal_position_size to help users stay within concentration limits."
        labels={{
          initial: "What portfolio would you like to analyze?\n\nExamples:\n• Analyze my portfolio: 100 AAPL, 50 MSFT, 25 GOOGL\n• Compare current vs proposed with 50 more TSLA\n• How much NVDA can I buy with 20% limit?",
        }}
      />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          padding: 3,
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
            Portfolio Risk Monitor
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Analyze portfolio risk metrics, set limits, and optimize position sizing
          </Typography>

          {/* Top Row: Portfolio Summary and Risk Alerts */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
              gap: 3,
              marginBottom: 3,
            }}
          >
            <DashboardPortfolioSummary />
            <DashboardRiskAlerts />
          </Box>

          {/* Middle Row: Position Table (full width) */}
          <Box sx={{ marginBottom: 3 }}>
            <DashboardPositionTable />
          </Box>

          {/* Bottom Row: Scenario Comparison and Position Sizer */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
              gap: 3,
            }}
          >
            <DashboardScenarioComparison />
            <DashboardPositionSizer />
          </Box>
        </Container>
      </Box>
    </CopilotKit>
  );
}
