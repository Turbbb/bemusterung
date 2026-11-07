const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const number = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

export const formatEuro = (value: number) => euro.format(value);
export const formatNumber = (value: number) => number.format(value);
export const formatArea = (value: number) => `${number.format(value)} m²`;

export const unitSuffix = { m2: "/m²", stk: "/Stk.", pauschal: " pauschal" } as const;
