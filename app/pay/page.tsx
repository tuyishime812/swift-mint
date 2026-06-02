import type { Metadata } from "next";
import { PayClient } from "./PayClient";

export const metadata: Metadata = {
  title: "Make a Payment",
  description: "Pay for your SwiftMint transfer using Airtel Money, TNM Mpamba, or National Bank transfer.",
};

export default function PayPage() {
  return <PayClient />;
}
