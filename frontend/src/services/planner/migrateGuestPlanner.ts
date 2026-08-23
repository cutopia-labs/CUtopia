import type { LocalPlannerService } from './LocalPlannerService';
import type { OnlinePlannerService } from './OnlinePlannerService';

export const migrateCurrentGuestTimetable = async (
  localService: LocalPlannerService,
  onlineService: OnlinePlannerService
): Promise<boolean> => {
  const selectedId = await localService.getSelectedTimetable();
  const localPlanner = selectedId
    ? await localService.getTimetable(selectedId)
    : null;
  const hasGuestWork = Boolean(
    localPlanner?.courses?.length || localPlanner?.tableName?.trim()
  );

  if (!hasGuestWork) return false;

  await onlineService.importTimetable(localPlanner);
  localService.removeMigratedTimetable(selectedId);
  return true;
};
