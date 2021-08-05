import { WEEKDAYS } from '../constants/states';

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
const addZero = (digit: number) => (digit > 9 ? digit : `0${digit}`);

export function getHHMM(timestamp: Date | string) {
  const time =
    typeof timestamp === 'object'
      ? timestamp
      : new Date(parseInt(timestamp, 10));
  return `${addZero(time.getHours())}:${addZero(time.getMinutes())}`;
}

export function getMMMDDYY(
  timestamp: string,
  showWeekday?: boolean,
  showMinutes?: boolean,
  hideYear?: boolean
) {
  const currentYear = new Date().getFullYear();
  const date = new Date(parseInt(timestamp, 10));
  const day = date.getDay();
  const timestampYear = date.getFullYear();
  hideYear = hideYear === undefined ? currentYear === timestampYear : hideYear;
  return `${showWeekday ? `${WEEKDAYS[day ? day - 1 : 6]}, ` : ''}${
    MONTHS[date.getMonth()]
  } ${date.getDate()}${hideYear ? '' : `, ${date.getFullYear()}`}${
    showMinutes ? `, ${getHHMM(timestamp)}` : ''
  }`;
}

export function getDateDifference(timestamp: string) {
  const now = new Date() as any;
  const old = new Date(parseInt(timestamp, 10)) as any;
  const diffHours = Math.floor((now - old) / (1000 * 60 * 60));
  if (diffHours < 1) {
    const diffMinites = Math.floor((now - old) / (1000 * 60));
    return diffMinites ? `${diffMinites} minutes ago` : 'just now';
  }
  if (diffHours < 24) {
    return `${Math.floor(diffHours)} hours ago`;
  }
  if (diffHours / 24 < 7) {
    return `${Math.floor(diffHours / 24)} days ago`;
  }
  if (diffHours / 24 <= 30) {
    return `${Math.floor(diffHours / 24 / 7)} weeks ago`;
  }
  if (diffHours / 24 / 30.41 < 12) {
    return `${Math.floor(diffHours / 24 / 30.41)} months ago`;
  }

  return `${Math.floor(diffHours / 24 / 30 / 12)} years ago`;
}
