type TimetableAccess = {
  username?: string;
  expire?: number;
  expireAt?: number;
};

/**
 * Owners can always read their timetable. Everyone else can only read an
 * explicitly shareable timetable, and temporary shares must not be expired.
 */
export const canReadTimetable = (
  timetable: TimetableAccess,
  requesterUsername?: string,
  now = Date.now()
) => {
  if (
    requesterUsername &&
    requesterUsername === String(timetable.username || '')
  ) {
    return true;
  }
  if (timetable.expire === 0) return true;
  return (
    Number(timetable.expire) > 0 && Number(timetable.expireAt) > Number(now)
  );
};
