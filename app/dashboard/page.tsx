import type { Metadata } from "next";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your SwiftMint transfer history, payment status, and transaction records.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
