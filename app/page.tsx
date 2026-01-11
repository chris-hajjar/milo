"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import StockCard from "@/components/StockCard";

export default function Home() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="copilotkit_agent"
    >
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex-1 flex items-center justify-center p-8">
          <StockCard />
        </div>

        <div className="w-[500px] flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CopilotChat
            instructions="You are a financial assistant that helps users get stock market information, news, and technical indicators using Yahoo Finance data."
            labels={{
              initial: "What stock would you like to know about?",
            }}
          />
        </div>
      </div>
    </CopilotKit>
  );
}
