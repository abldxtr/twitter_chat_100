import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isSameWeek, isSameYear } from "date-fns";
import { faIR } from "date-fns-jalali/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMessageDate = (date: Date) => {
  if (isToday(date)) return "امروز";
  if (isYesterday(date)) return "دیروز";
  if (isSameWeek(date, new Date()))
    return format(date, "EEEE", { locale: faIR });
  if (isSameYear(date, new Date()))
    return format(date, "d MMMM", { locale: faIR });
  return format(date, "d MMMM yyyy", { locale: faIR });
};

export const formatPersianDate = (date: Date) => {
  const now = new Date();
  const formatString = isSameYear(date, now)
    ? "d MMMM، HH:mm"
    : "d MMMM yyyy، HH:mm";
  const persianDate = format(date, formatString, { locale: faIR });
  return persianDate.replace(
    /[0-9]/g,
    (digit) =>
      ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(digit)]
  );
};
