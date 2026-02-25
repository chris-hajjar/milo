"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import StockCard from "@/components/StockCard";
import PriceChart from "@/components/PriceChart";
import BollingerBandsChart from "@/components/BollingerBandsChart";

export default function Home() {
  return (
    <>
      <StockCard />
      <PriceChart />
      <BollingerBandsChart />
      <CopilotChat
        instructions="You are a financial assistant that helps users get stock market information, news, and technical indicators using Yahoo Finance data."
        labels={{
          initial: "What stock would you like to know about?",
        }}
      />
    </>
  );
}
