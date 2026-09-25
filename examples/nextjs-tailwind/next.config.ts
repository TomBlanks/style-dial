import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't generate AGENTS.md / CLAUDE.md into the example.
  agentRules: false,
};

export default nextConfig;
