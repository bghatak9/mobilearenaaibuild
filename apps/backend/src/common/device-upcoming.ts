/** Whether launch dates qualify as "upcoming" for catalog display. */
export function isUpcomingByDates(
  announcedDate: Date | null | undefined,
  releasedDate: Date | null | undefined,
  now = Date.now(),
): boolean {
  const announced = announcedDate?.getTime();
  const released = releasedDate?.getTime();

  if (released != null && !Number.isNaN(released) && released > now) return true;
  if (announced != null && !Number.isNaN(announced) && announced > now) return true;

  if (announced != null && !Number.isNaN(announced) && announced <= now) {
    const hasFutureRelease =
      released != null && !Number.isNaN(released) && released > now;
    const awaitingRelease = released == null || Number.isNaN(released);
    const recentlyAnnounced = now - announced <= 120 * 86_400_000;
    if ((hasFutureRelease || awaitingRelease) && recentlyAnnounced) return true;
  }

  return false;
}

export function upcomingLaunchTimestamp(
  announcedDate: Date | null | undefined,
  releasedDate: Date | null | undefined,
): number | null {
  const released = releasedDate?.getTime();
  if (released != null && !Number.isNaN(released)) return released;
  const announced = announcedDate?.getTime();
  return announced != null && !Number.isNaN(announced) ? announced : null;
}
