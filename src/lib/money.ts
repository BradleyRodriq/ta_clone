import { differenceInCalendarDays, differenceInHours } from "date-fns";
import { platformServiceFeeRate } from "./constants";

export function splitPayment(total: number) {
  const rate = platformServiceFeeRate();
  const serviceFee = Math.round(total * rate * 100) / 100;
  const ownerAmount = Math.round((total - serviceFee) * 100) / 100;
  return {
    amountSubtotal: total,
    serviceFeeAmount: serviceFee,
    ownerAmount,
  };
}

export function computeRentalTotal(params: {
  pricingMode: "HOUR" | "DAY";
  pricePerHour: number;
  pricePerDay: number;
  start: Date;
  end: Date;
}): number {
  const { pricingMode, pricePerHour, pricePerDay, start, end } = params;
  if (end <= start) return 0;
  if (pricingMode === "HOUR") {
    const hours = Math.max(1, differenceInHours(end, start));
    return Math.round(hours * pricePerHour * 100) / 100;
  }
  const days = Math.max(1, differenceInCalendarDays(end, start));
  return Math.round(days * pricePerDay * 100) / 100;
}
