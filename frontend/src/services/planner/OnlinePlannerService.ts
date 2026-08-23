import { ApolloClient } from '@apollo/client';
import { isEqual } from 'lodash';
import {
  REMOVE_TIMETABLE,
  SWITCH_TIMETABLE,
  UPLOAD_TIMETABLE,
} from '../../constants/mutations';
import { GET_TIMETABLE, GET_USER_TIMETABLES } from '../../constants/queries';
import client from '../../helpers/apollo-client';
import { userStore } from '../../store';
import {
  Planner,
  TimetableOverviewMode,
  TimetableOverviewWithMode,
  UploadTimetable,
  PlannerDelta,
} from '../../types';
import { coursesToEntries, entriesToCourses } from '../../helpers/dtos';
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

  public async getTimetableOverviews(): Promise<TimetableOverviewWithMode[]> {
    const { data } = await this.client.query({
      query: GET_USER_TIMETABLES,
      fetchPolicy: 'network-only',
    });
    userStore.updateStore('data', {
      ...userStore.data,
      timetableId: data?.me?.timetableId,
    });
    return (data?.me?.timetables || []).map(timetable => ({
      ...timetable,
      expire: timetable.expire ?? EXPIRE_LOOKUP.upload,
      mode:
        timetable.expireAt > 0
          ? TimetableOverviewMode.SHARE
          : TimetableOverviewMode.UPLOAD,
    }));
  }

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
    return remoteToPlanner(
      (remoteTimetable as any)._id || switchTo,
      remoteTimetable
    );
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
    return overview;
  }

  public async importTimetable(planner: Planner): Promise<string> {
    const variables = {
      entries: coursesToEntries(planner.courses),
      expire: EXPIRE_LOOKUP.upload,
      tableName: planner.tableName || '',
    };

    try {
      const { data } = await this.client.mutate({
        mutation: UPLOAD_TIMETABLE,
        variables,
      });
      const id = data?.uploadTimetable?._id;
      if (!id) throw new Error('Could not sync the on-device timetable');
      return id;
    } catch (error) {
      // A dropped response may hide a successful create. Check the selected
      // cloud timetable before retrying so a guest plan is not duplicated.
      try {
        await this.getTimetableOverviews();
        const selectedId = await this.getSelectedTimetable();
        const selected = selectedId
          ? await this.getTimetable(selectedId)
          : null;
        if (
          selected &&
          (selected.tableName || '') === (planner.tableName || '') &&
          isEqual(selected.courses, planner.courses)
        ) {
          return selectedId;
        }
      } catch (_) {
        // Preserve and report the original upload error.
      }
      throw error;
    }
  }

  public async saveTimetable(id: string, delta: PlannerDelta): Promise<void> {
    const input: Record<string, any> = { ...delta };
    if (delta.courses) {
      input.entries = coursesToEntries(delta.courses);
      delete input.courses;
    }
    await this.client.mutate({
      mutation: UPLOAD_TIMETABLE,
      variables: {
        _id: id,
        ...input,
        expire: EXPIRE_LOOKUP.default,
      },
    });
  }
}
