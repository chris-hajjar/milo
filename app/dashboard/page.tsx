"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import DashboardStockCard from "@/components/dashboard/DashboardStockCard";
import DashboardPriceChart from "@/components/dashboard/DashboardPriceChart";
import DashboardBollingerBandsChart from "@/components/dashboard/DashboardBollingerBandsChart";
import { Box, Container } from "@mui/material";

export default function Dashboard() {
  return (
    <>
      <CopilotSidebar
        defaultOpen={false}
        clickOutsideToClose={true}
        instructions="You are a financial assistant that helps users get stock market information, news, and technical indicators using Yahoo Finance data."
        labels={{
          initial: "What stock would you like to know about?",
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
          {/* Top Row: StockCard and PriceChart */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              marginBottom: 3,
            }}
          >
            <DashboardStockCard />
            <DashboardPriceChart />
          </Box>

          {/* Bottom Row: BollingerBandsChart (full width) */}
          <Box>
            <DashboardBollingerBandsChart />
          </Box>
        </Container>
      </Box>
    </>
  );
}
