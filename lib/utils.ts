import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isSameWeek, isSameYear } from "date-fns";
import { faIR } from "date-fns-jalali/locale";
import moment from "moment-jalaali";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMessageDate = (date: Date) => {
  // const persianDate = moment(date).format("jYYYY/jMM/jDD HH:mm:ss");
  const persianMonths = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  const now = moment();
  const persianDate = moment(date);
  const diffDays = now.diff(persianDate, "days");

  let result: string;

  if (diffDays === 0) {
    result = "امروز";
  } else if (diffDays === 1) {
    result = "دیروز";
  } else {
    const day = persianDate.jDate();
    const month = persianDate.jMonth(); // 0-indexed
    result = `${day} ${persianMonths[month]}`;
  }

  // تبدیل اعداد به فارسی
  return result.replace(
    /[0-9]/g,
    (digit) =>
      ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(digit)]
  );
};

export const formatPersianDate = (date: Date) => {
  const persianMonths = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  const now = moment();
  const persianDate = moment(date);
  const diffDays = now.diff(persianDate, "days");

  const year = persianDate.jYear();
  const month = persianDate.jMonth(); // 0-indexed
  const day = persianDate.jDate();
  const time = persianDate.format("HH:mm");

  let result: string;

  if (diffDays === 0) {
    result = `امروز ${time}`;
  } else if (diffDays === 1) {
    result = `دیروز ${time}`;
  } else if (now.jYear() === year) {
    result = `${day} ${persianMonths[month]} ${time}`;
  } else {
    result = `${day} ${persianMonths[month]} ${year} ${time}`;
  }

  // تبدیل اعداد به فارسی
  return result.replace(
    /[0-9]/g,
    (digit) =>
      ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(digit)]
  );
  // const now = new Date();
  // const formatString = isSameYear(date, now)
  //   ? "d MMMM، HH:mm"
  //   : "d MMMM yyyy، HH:mm";
  // const persianDate = format(date, formatString, { locale: faIR });
  // // console.log("persianDate", persianDate);
  // return persianDate.replace(
  //   /[0-9]/g,
  //   (digit) =>
  //     ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(digit)]
  // );
};
