// Currency formatting utility for Aemeth Trader Analysis Marketplace

export const USD_TO_IDR_RATE = 16000;

export function formatPrice(priceCents: number, lang: 'id' | 'en', explicitIdr?: number): string {
  if (lang === 'id') {
    const idrAmount = explicitIdr ?? Math.round((priceCents / 100) * USD_TO_IDR_RATE);
    return `Rp ${idrAmount.toLocaleString('id-ID')}`;
  }
  return `$${(priceCents / 100).toFixed(0)} USD`;
}

export function formatPriceExact(priceCents: number, lang: 'id' | 'en', explicitIdr?: number): string {
  if (lang === 'id') {
    const idrAmount = explicitIdr ?? Math.round((priceCents / 100) * USD_TO_IDR_RATE);
    return `Rp ${idrAmount.toLocaleString('id-ID')}`;
  }
  return `$${(priceCents / 100).toFixed(2)} USD`;
}

export function getPriceAmount(priceCents: number, lang: 'id' | 'en', explicitIdr?: number): { amount: string; currency: string } {
  if (lang === 'id') {
    const idrAmount = explicitIdr ?? Math.round((priceCents / 100) * USD_TO_IDR_RATE);
    return {
      amount: `Rp ${idrAmount.toLocaleString('id-ID')}`,
      currency: 'IDR',
    };
  }
  return {
    amount: `$${(priceCents / 100).toFixed(0)}`,
    currency: 'USD',
  };
}

export function formatIdr(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
}
