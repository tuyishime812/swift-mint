import { pricing } from "@/lib/swiftmint";

export function PricingCards() {
  return (
    <div className="pricing-grid">
      {pricing.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.description}</small>
        </div>
      ))}
    </div>
  );
}
