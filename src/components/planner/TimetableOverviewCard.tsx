import { useLazyQuery, useMutation } from '@apollo/client';
import { FC, useEffect, useState } from 'react';

import copy from 'copy-to-clipboard';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import styles from '../../styles/components/planner/TimetableOverviewCard.module.scss';
import { GET_USER_TIMETABLES } from '../../constants/queries';
import { usePlanner, useView } from '../../store';
import {
  ErrorCardMode,
  TimetableOverviewMode,
  TimetableOverviewWithMode,
  UserData,
} from '../../types';
import AccordionCard from '../atoms/AccordionCard';
import Loading from '../atoms/Loading';
import ErrorCard from '../molecules/ErrorCard';
import { REMOVE_TIMETABLE } from '../../constants/mutations';
import { generateTimetableURL } from './PlannerTimetable';
import { TimetableOverviewListItem } from './TimetableOverview';

const getTimetableOverviewMode = (expire: number) => {
  if (expire > 0) {
    return TimetableOverviewMode.SHARE;
  }
  if (expire === 0) {
    return TimetableOverviewMode.UPLOAD_SHARABLE;
  }
  return TimetableOverviewMode.UPLOAD;
};

const getCombinedTimetable = (data: UserData): TimetableOverviewWithMode[] => {
  if (!data?.me?.timetables) {
    return [];
  }
  return (data?.me?.timetables[TimetableOverviewMode.UPLOAD] || [])
    .concat(
      [...(data?.me?.timetables[TimetableOverviewMode.SHARE] || [])].sort(
        (a, b) => (a.createdAt > b.createdAt ? -1 : 1)
      )
    )
    .map(item => ({
      ...item,
      mode: getTimetableOverviewMode(item.expire),
    }));
};

const TimetableOverviewCard: FC = () => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const view = useView();
  const planner = usePlanner();
  const [removeTimetable, { loading: removeTimetableLoading }] =
    useMutation(REMOVE_TIMETABLE);
  const [
    getUserTimetable,
    { data: userTimetable, loading: userTimetableLoading },
  ] = useLazyQuery(GET_USER_TIMETABLES, {
    onCompleted: async data => {
      console.log(`fetched tiemtable`);
      planner.updateStore('remoteTimetableData', getCombinedTimetable(data));
    },
    onError: view.handleError,
  });
  console.log('Remote being mounted!!!');
  useEffect(() => {
    if (expanded && !userTimetableLoading && !userTimetable) {
      getUserTimetable();
    }
  }, [expanded]);

  const onDownload = (id: string, createdAt: number) => {
    router.push(`/planner?sid=${id}`, undefined, { shallow: true });
  };
  const onShare = (id: string) => {
    copy(generateTimetableURL(id));
    view.setSnackBar('Copied share link!');
  };
  const onDelete = async (id: string, expire: number) => {
    try {
      await removeTimetable({
        variables: {
          id,
          expire,
        },
      });
      planner.updateStore(
        'remoteTimetableData',
        [...planner.remoteTimetableData].filter(item => item._id !== id)
      );
      view.setSnackBar('Deleted!');
      // i.e. if current planner is deleted
      if (id === planner.plannerId) {
        // Back to homepage
        router.push(`/planner`, undefined, { shallow: true });
      }
    } catch (e) {
      // To skip remove entry in state in case of any error
      view.handleError(e);
    }
  };
  const renderChildren = () => {
    if (userTimetableLoading || !planner.remoteTimetableData) {
      return <Loading />;
    }
    if (!planner.remoteTimetableData.length) {
      return <ErrorCard mode={ErrorCardMode.NULL} />;
    }
    return planner.remoteTimetableData.map(item => (
      <TimetableOverviewListItem
        key={`${item.createdAt}${item._id}`}
        item={item}
        onShare={onShare}
        onDelete={onDelete}
        onClick={() => {}}
        selected={false}
      />
    ));
  };
  return (
    <AccordionCard
      className={styles.timetableOverview}
      expanded={expanded}
      onChange={(e, expanded) => setExpanded(expanded)}
      title="Remote"
    >
      {renderChildren()}
    </AccordionCard>
  );
};

export default observer(TimetableOverviewCard);
