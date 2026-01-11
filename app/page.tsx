"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import StockCard from "@/components/StockCard";

export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="yahoo_finance_agent">
      <div className="flex h-screen">
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <StockCard />
        </main>

        <CopilotSidebar
          defaultOpen={true}
          instructions="You are a financial assistant that helps users get stock market information, news, and technical indicators using Yahoo Finance data."
          labels={{
            initial: "What stock would you like to know about?",
          }}
        />
      </div>
    </CopilotKit>
  );
}
