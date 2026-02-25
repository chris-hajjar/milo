"use client";

import "./globals.css";
import Navigation from "@/components/Navigation";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CopilotKit runtimeUrl="/api/copilotkit" agent="copilotkit_agent">
          <Navigation />
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
