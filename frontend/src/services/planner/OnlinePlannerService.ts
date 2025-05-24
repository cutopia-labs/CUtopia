import { ApolloClient } from '@apollo/client';
import {
  REMOVE_TIMETABLE,
  SWITCH_TIMETABLE,
  UPLOAD_TIMETABLE,
} from '../../constants/mutations';
import client from '../../helpers/apollo-client';
import { userStore } from '../../store';
import { GET_TIMETABLE } from '../../constants/queries';
import {
  Planner,
  TimetableOverviewMode,
  TimetableOverviewWithMode,
  UploadTimetable,
} from '../../types';
import { entriesToCourses } from '../../helpers/dtos';
import { EXPIRE_LOOKUP } from '../../constants';
import { IPlannerService } from './PlannerService.interface';

const remoteToPlanner = (id: string, timetable: UploadTimetable): Planner => {
  return {
    createdAt: timetable.createdAt,
    tableName: timetable.tableName,
    expireAt: timetable.expireAt,
    id,
    courses: entriesToCourses(timetable.entries),
  };
};

export class OnlinePlannerService implements IPlannerService {
  private static instance: OnlinePlannerService;
  private client: ApolloClient<any>;

  private constructor() {
    this.client = client;
  }

  public static getInstance(): OnlinePlannerService {
    if (!OnlinePlannerService.instance) {
      OnlinePlannerService.instance = new OnlinePlannerService();
    }
    return OnlinePlannerService.instance;
  }

  public async getSelectedTimetable(): Promise<string> {
    return userStore.data?.timetableId;
  }

  public async getTimetable(id: string): Promise<Planner | null> {
    const { data } = await this.client.query({
      query: GET_TIMETABLE,
      variables: { id },
    });
    const remoteTimetable: UploadTimetable | undefined = data?.timetable;
    if (!remoteTimetable) return null;

    // convert remote timetable to local timetable
    return remoteToPlanner(id, remoteTimetable);
  }

  // const onDelete = async (id: string) => {
  //   try {
  //     const isCurrentPlanner = id === planner.plannerId;
  //     /* Get next timetable id if deleting current planner */
  //     const variables: any = {
  //       id,
  //     };
  //     /* Undefined switch to means not deleting current ttb, no need switch */
  //     let switchTo = undefined;
  //     if (isCurrentPlanner) {
  //       let maxCreatedAt = 0;
  //       /* If it's the last ttb, then switch to null means create one */
  //       switchTo = null;
  //       planner.timetableOverviews.forEach(d => {
  //         if (d.createdAt > maxCreatedAt && d._id !== id) {
  //           maxCreatedAt = d.createdAt;
  //           switchTo = d._id;
  //         }
  //       });
  //       variables.switchTo = switchTo;
  //     }
  //     const { data } = await removeTimetable({
  //       variables,
  //     });
  //     view.setSnackBar('Deleted!');
  //     /* Update the timetableOverviews */
  //     planner.removeTimetableOverview(id);
  //     /* Switch to the new if deleting current planner */
  //     if (isCurrentPlanner) {
  //       if (data?.removeTimetable) {
  //         applyTimetable(
  //           data?.removeTimetable,
  //           switchTo || data?.removeTimetable?._id,
  //           undefined,
  //           !switchTo
  //         );
  //       } else {
  //         createTimetable();
  //       }
  //     }
  //   } catch (e) {
  //     // To skip remove entry in state in case of any error
  //     view.handleError(e);
  //   }
  // };

  public async deleteAndSwitchTimetable(
    id: string,
    switchTo: string | null | undefined
  ): Promise<Planner | null> {
    const { data } = await this.client.mutate({
      mutation: REMOVE_TIMETABLE,
      variables: { id, switchTo },
    });

    const remoteTimetable: UploadTimetable | undefined = data?.removeTimetable;
    if (!remoteTimetable) return null;
    return remoteToPlanner(id, remoteTimetable);
  }

  public async switchTimetable(id: string): Promise<Planner | null> {
    const { data } = await this.client.mutate({
      mutation: SWITCH_TIMETABLE,
      variables: { id },
    });

    const remoteTimetable: UploadTimetable | undefined = data?.switchTimetable;
    if (!remoteTimetable) return null;
    return remoteToPlanner(id, remoteTimetable);
  }

  // const createTimetable = async () => {
  //   try {
  //     const { data } = await uploadTimetable({
  //       variables: {
  //         entries: [],
  //         expire: EXPIRE_LOOKUP.upload,
  //       },
  //     });
  //     view.setSnackBar('Timetable created!');
  //     const timetable = data?.uploadTimetable;
  //     const overview = {
  //       _id: timetable._id,
  //       createdAt: timetable.createdAt,
  //       tableName: '',
  //       expireAt: -1,
  //       mode: TimetableOverviewMode.UPLOAD,
  //     };
  //     planner.updateTimetableOverview(overview, true);
  //     /* If it's create new, then only need update local plannerId, cuz remote is updated */
  //     planner.updateStore('plannerId', timetable._id);
  //     const newTimetable = data?.uploadTimetable;
  //     planner.newPlanner(newTimetable?._id, newTimetable?.createdAt);
  //   } catch {
  //     /* Update planner id to prevent create ttb called inf times */
  //     planner.updateStore('plannerId', 'FAIL');
  //     view.warn('Create timetable failed...');
  //   }
  // };

  public async createTimetable(): Promise<TimetableOverviewWithMode> {
    const { data } = await this.client.mutate({
      mutation: UPLOAD_TIMETABLE,
      variables: { entries: [], expire: EXPIRE_LOOKUP.upload },
    });

    const timetable = data?.uploadTimetable;
    const overview: TimetableOverviewWithMode = {
      _id: timetable._id,
      createdAt: timetable.createdAt,
      tableName: '',
      expireAt: -1,
      mode: TimetableOverviewMode.UPLOAD,
      expire: EXPIRE_LOOKUP.upload,
    };
    // planner.updateTimetableOverview(overview, true);
    // /* If it's create new, then only need update local plannerId, cuz remote is updated */
    // planner.updateStore('plannerId', timetable._id);
    // const newTimetable = data?.uploadTimetable;
    // planner.newPlanner(newTimetable?._id, newTimetable?.createdAt);

    return overview;
  }
}
