import { addZero } from './getTime';

const PRODID = 'cutopia-labs';
const SEP = '\n';
const ICS_FOOTER = 'END:VCALENDAR';

export const formatIcsDate = (date: Date) => {
  return [
    date.getFullYear(),
    addZero(date.getMonth() + 1),
    addZero(date.getDate()),
    'T',
    addZero(date.getHours()),
    addZero(date.getMinutes()),
    addZero(date.getSeconds()),
  ].join('');
};

export type IcsEvent = {
  startTime: string;
  endTime: string;
  location?: string;
  title?: string;
  uid?: string;
};

/**
 * Used to create a iCal object with one or multiple events
 */
export default class ICS {
  private prodid: string;
  private events: string[];
  private tzone: string;
  private numEvents: number;
  constructor(prodid = PRODID, tzone = 'Asia/Hong_Kong') {
    this.prodid = prodid;
    this.events = [];
    this.tzone = tzone;
    this.numEvents = 0;
  }
  get content() {
    const evsStr = this.events.map(ev => ev).join(SEP);
    return [this.header, evsStr, ICS_FOOTER].join(SEP);
  }
  get length() {
    return this.numEvents;
  }
  private get header() {
    return ['BEGIN:VCALENDAR', `PRODID:${this.prodid}`, 'VERSION:2.0'].join(
      SEP
    );
  }
  private get timestamp() {
    return formatIcsDate(new Date());
  }
  private _addEvent(ev: string) {
    this.events.push(ev);
    this.numEvents++;
  }
  getIcsFile(filename: string) {
    return new File([this.content], filename, { type: 'plain/text' });
  }
  addEvent(ev: IcsEvent) {
    const uid = ev.uid || `${ev.title}_${ev.startTime}`;
    const evStr = [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `SUMMARY:${ev.title}`,
      `DTSTAMP:${this.timestamp}`,
      `DTSTART:${ev.startTime}`,
      `DTEND:${ev.endTime}`,
      `LOCATION:${ev.location}`,
      'END:VEVENT',
    ].join(SEP);
    this._addEvent(evStr);
  }
  addEvents(events: IcsEvent[]) {
    events.forEach(ev => this.addEvent(ev));
  }
}
