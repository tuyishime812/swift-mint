export type FxRates = Record<string, number>;

let cachedRates: FxRates | null = null;
let cacheTime = 0;
const CACHE_TTL = 3600000;

export async function fetchFxRates(): Promise<FxRates> {
  if (cachedRates && Date.now() - cacheTime < CACHE_TTL) {
    return cachedRates;
  }
  const res = await fetch("https://open.er-api.com/v6/latest/MWK");
  if (!res.ok) throw new Error("Failed to fetch exchange rates");
  const data = await res.json();
  cachedRates = data.rates as FxRates;
  cacheTime = Date.now();
  return cachedRates!;
}

export function getFxRate(rates: FxRates, currencyCode: string): number {
  return rates[currencyCode] ?? 0;
}

export function convertMwK(amountMwK: number, rate: number): number {
  return amountMwK * rate;
}
