"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, Tab, Box } from "@mui/material";

const Navigation = () => {
  const pathname = usePathname();

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname === "/") return 0;
    if (pathname === "/dashboard") return 1;
    if (pathname === "/risk") return 2;
    if (pathname === "/transactions") return 3;
    return 0;
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#FFFFFF",
        borderBottom: "1px solid #E5E5E5",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Tabs
        value={getActiveTab()}
        sx={{
          minHeight: "48px",
          "& .MuiTabs-indicator": {
            backgroundColor: "#5C1DB0",
            height: "3px",
          },
          "& .MuiTab-root": {
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: "14px",
            fontWeight: 500,
            textTransform: "none",
            color: "#6B6B6B",
            minHeight: "48px",
            padding: "12px 24px",
            transition: "color 0.2s ease",
            "&:hover": {
              color: "#1A1A1A",
            },
            "&.Mui-selected": {
              color: "#1A1A1A",
            },
          },
        }}
      >
        <Tab label="Home" component={Link} href="/" />
        <Tab label="Dashboard" component={Link} href="/dashboard" />
        <Tab label="Risk" component={Link} href="/risk" />
        <Tab label="Activity" component={Link} href="/transactions" />
      </Tabs>
    </Box>
  );
};

export default Navigation;
