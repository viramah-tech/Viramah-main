/**
 * deadlineUtils.ts — Deadline display helpers for the deposit & hold flow.
 * All calculations are relative to the current time (no server dependency).
 */

export interface TimeRemaining {
  days: number;
  hours: number;
  totalMinutes: number;
  isExpired: boolean;
}

/**
 * Returns days and hours remaining until a deadline.
 * Returns { days: 0, hours: 0, totalMinutes: 0, isExpired: true } if past.
 */
export function getDaysHoursRemaining(deadline: Date | string | null | undefined): TimeRemaining {
  if (!deadline) return { days: 0, hours: 0, totalMinutes: 0, isExpired: true };

  const deadlineMs = new Date(deadline).getTime();
  const nowMs = Date.now();
  const diffMs = deadlineMs - nowMs;

  if (diffMs <= 0) return { days: 0, hours: 0, totalMinutes: 0, isExpired: true };

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return { days, hours, totalMinutes, isExpired: false };
}

/**
 * Returns a human-readable string: "3 days 4 hrs", "6 hrs", or "Expired".
 */
export function formatDeadlineDisplay(deadline: Date | string | null | undefined): string {
  const { days, hours, isExpired } = getDaysHoursRemaining(deadline);
  if (isExpired) return "Expired";
  if (days === 0 && hours === 0) return "Less than 1 hr";
  if (days === 0) return `${hours} hr${hours !== 1 ? "s" : ""}`;
  if (hours === 0) return `${days} day${days !== 1 ? "s" : ""}`;
  return `${days} day${days !== 1 ? "s" : ""} ${hours} hr${hours !== 1 ? "s" : ""}`;
}

/**
 * Returns true if the deadline is within `thresholdDays` from now (and not expired).
 */
export function isUrgent(
  deadline: Date | string | null | undefined,
  thresholdDays: number
): boolean {
  const { days, isExpired } = getDaysHoursRemaining(deadline);
  if (isExpired) return false;
  return days < thresholdDays;
}
