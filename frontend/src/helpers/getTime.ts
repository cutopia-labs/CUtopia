import { WEEKDAYS } from '../constants';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
export const addZero = (digit: number) => (digit > 9 ? digit : `0${digit}`);

export const daysDiff = (d1: number, d2: number) => {
  const diff = d1 - d2;
  return Math.ceil(diff / (1000 * 3600 * 24));
};
export function getHHMM(timestamp: Date | string | number) {
  const time =
    typeof timestamp === 'object'
      ? timestamp
      : new Date(parseInt(timestamp as any, 10));
  return `${addZero(time.getHours())}:${addZero(time.getMinutes())}`;
}

export function getMMMDDYY(
  timestamp: string | number,
  showWeekday?: boolean,
  showMinutes?: boolean,
  hideYear?: boolean
) {
  const currentYear = new Date().getFullYear();
  const date = new Date(parseInt(timestamp as any, 10));
  const day = date.getDay();
  const timestampYear = date.getFullYear();
  hideYear = hideYear === undefined ? currentYear === timestampYear : hideYear;
  return `${showWeekday ? `${WEEKDAYS[day ? day - 1 : 6]}, ` : ''}${
    MONTHS[date.getMonth()]
  } ${date.getDate()}${hideYear ? '' : `, ${date.getFullYear()}`}${
    showMinutes ? `, ${getHHMM(timestamp)}` : ''
  }`;
}

export function getDateDifference(timestamp: string | number) {
  timestamp =
    typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  const now = +new Date();
  const old = +new Date(timestamp);
  let diffHours = Math.floor((now - old) / (1000 * 60 * 60));
  const isFuture = diffHours < 0;
  const suffix = isFuture ? '' : ' ago';
  diffHours = Math.abs(diffHours);
  if (diffHours < 1) {
    const diffMinites = Math.floor((now - old) / (1000 * 60));
    return diffMinites ? `${diffMinites} minutes${suffix}` : 'just now';
  }
  if (diffHours < 24) {
    return `${Math.floor(diffHours)} hours${suffix}`;
  }
  if (diffHours / 24 < 7) {
    return `${Math.floor(diffHours / 24)} days${suffix}`;
  }
  if (diffHours / 24 <= 30) {
    return `${Math.floor(diffHours / 24 / 7)} weeks${suffix}`;
  }
  if (diffHours / 24 / 30.41 < 12) {
    return `${Math.floor(diffHours / 24 / 30.41)} months${suffix}`;
  }

  return `${Math.floor(diffHours / 24 / 30 / 12)} years${suffix}`;
}
