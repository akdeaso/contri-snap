import { MONTH_NAMES } from '@/constants';

export function getCurrentMonth() {
  return MONTH_NAMES[new Date().getMonth()];
}

export function getCurrentYear() {
  return new Date().getFullYear().toString();
}

export function getMonthIndex(monthName: string) {
  return MONTH_NAMES.indexOf(monthName);
}

export function formatMonthYearToInput(month: string, year: string) {
  const monthIndex = getMonthIndex(month);
  const monthNum = monthIndex >= 0 ? String(monthIndex + 1).padStart(2, '0') : String(new Date().getMonth() + 1).padStart(2, '0');
  return `${year || getCurrentYear()}-${monthNum}`;
}

export function parseInputToMonthYear(value: string) {
  if (!value) return null;
  const [year, monthNum] = value.split('-');
  const month = MONTH_NAMES[parseInt(monthNum) - 1] || getCurrentMonth();
  return { month, year };
}
