const DAY = 86_400_000;

export interface PantryStock {
  ID: string;
  itemID: string;
  currentQuantity: number | string | null;
  minStockLevel: number | string | null;
  consumptionRate: number | string | null;
}

interface Outlook {
  stockStatus: 'OK' | 'WORRIED' | 'PANIC' | 'UNKNOWN';
  daysUntilEmpty: number | null;
  /** Days until stock drops below the minimum (0 = already below); shown next to the lead time. */
  daysUntilMinimum: number | null;
  orderBy: string | null;
  orderQuantity: number | null;
  orderLate: boolean;
  supplierName: string;
  leadDays: number;
}

function supplier(item: string): [string, number] {
  switch (item) {
    case 'MILK': return ['Local Dairy Farm', 1];
    case 'FLOUR': case 'GRAIN': return ['North Mill', 3];
    case 'EGGS': case 'BUTTER': return ['South Meadow Farms', 2];
    default: return ['Travelling merchant', 7];
  }
}

export function pantryOutlook(stock: PantryStock, now: Date): Outlook {
  const [supplierName, leadDays] = supplier(stock.itemID);
  const result: Outlook = { stockStatus: 'UNKNOWN', daysUntilEmpty: null, daysUntilMinimum: null, orderBy: null, orderQuantity: null, orderLate: false, supplierName, leadDays };
  const inputs = [stock.currentQuantity, stock.minStockLevel, stock.consumptionRate];
  if (inputs.some((value) => value === null || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0)) return result;
  const [quantity, minimum, daily] = inputs.map(Number);
  result.stockStatus = quantity < minimum / 2 ? 'PANIC' : quantity < minimum ? 'WORRIED' : 'OK';
  const start = now.getTime();
  const flour = stock.itemID === 'FLOUR';
  const weekUse = (flour ? 8 : 7) * daily;

  // The local demo uses UTC and spreads each day's usage evenly over that day.
  function usageUntil(end: number): number {
    let used = 0;
    for (let time = start; time < end;) {
      const weeks = Math.floor((end - time) / (7 * DAY));
      if (weeks > 0) {
        used += weeks * weekUse;
        time += weeks * 7 * DAY;
        continue;
      }
      const next = Math.min(end, (Math.floor(time / DAY) + 1) * DAY);
      used += daily * multiplier(time) * (next - time) / DAY;
      time = next;
    }
    return used;
  }

  function multiplier(time: number): number {
    return flour && new Date(time).getUTCDay() === 6 ? 2 : 1;
  }

  function reaches(amount: number): number {
    let time = start;
    let remaining = Math.max(0, amount);
    const nextMidnight = (Math.floor(start / DAY) + 1) * DAY;
    const firstRate = daily * multiplier(time);
    const firstUse = firstRate * (nextMidnight - time) / DAY;
    if (remaining <= firstUse) return time + remaining / firstRate * DAY;
    remaining -= firstUse;
    const weeks = Math.floor(remaining / weekUse);
    time = nextMidnight + weeks * 7 * DAY;
    remaining -= weeks * weekUse;
    while (remaining > daily * multiplier(time)) {
      remaining -= daily * multiplier(time);
      time += DAY;
    }
    return time + remaining / (daily * multiplier(time)) * DAY;
  }

  if (daily > 0) result.daysUntilEmpty = Math.floor((reaches(quantity) - start) / DAY * 100) / 100;
  if (daily > 0) result.daysUntilMinimum = quantity < minimum ? 0 : Math.floor((reaches(quantity - minimum) - start) / DAY * 10) / 10;
  if (daily === 0 && quantity >= minimum) return result;
  const deadline = quantity < minimum ? start - 1 : reaches(quantity - minimum) - leadDays * DAY;
  const morning = Math.floor((deadline - 5 * 3_600_000) / DAY) * DAY + 5 * 3_600_000;
  const orderTime = Math.max(start, morning);
  result.orderLate = deadline < start;
  result.orderBy = new Date(orderTime).toISOString().slice(0, 10);
  const arrivalStock = Math.max(0, quantity - usageUntil(orderTime + leadDays * DAY));
  result.orderQuantity = Math.ceil((minimum + weekUse - arrivalStock) * 100 - 1e-8) / 100;
  return result;
}
