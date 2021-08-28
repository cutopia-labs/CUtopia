import { useLazyQuery } from '@apollo/client';
import { useEffect, useContext, useState } from 'react';
import pluralize from 'pluralize';

import { AiOutlineCloudDownload, AiOutlineShareAlt } from 'react-icons/ai';
import { IconButton } from '@material-ui/core';
import { Timer } from '@material-ui/icons';
import copy from 'copy-to-clipboard';
import { useHistory } from 'react-router-dom';
import { PLANNER_CONFIGS } from '../../constants/configs';
import './TimetableOverviewCard.scss';
import { GET_USER_TIMETABLES } from '../../constants/queries';
import { getMMMDDYY } from '../../helpers/getTime';
import { ViewContext } from '../../store';
import {
  ErrorCardMode,
  TimetableOverviewMode,
  TimetableOverviewWithMode,
} from '../../types';
import AccordionCard from '../atoms/AccordionCard';
import Loading from '../atoms/Loading';
import ErrorCard from '../molecules/ErrorCard';
import ListItem from '../molecules/ListItem';
import { generateTimetableURL } from './PlannerTimetable';

const getExpire = (mode: TimetableOverviewMode, expire: number) => {
  if (mode === TimetableOverviewMode.SHARE) {
    console.log(expire);
    return (
      <>
        {' • '}
        <Timer />
        {`${pluralize('day', expire, true)}`}
      </>
    );
  }
  return '';
};

const getTimetableOverviewMode = (expire: number) => {
  if (expire > 0) {
    return TimetableOverviewMode.SHARE;
  }
  return TimetableOverviewMode.NON_EXPIRE;
};

const getCombinedTimetable = (data): TimetableOverviewWithMode[] => {
  return (data.me.timetables || [])
    .concat(data.me.sharedTimetables || [])
    .map((item) => ({
      ...item,
      mode: getTimetableOverviewMode(item.expire),
    }));
};

type TimetableOverviewListItemProps = {
  item: TimetableOverviewWithMode;
  onShare: (id: string) => void;
  onDownload: (id: string) => void;
};

const TimetableOverviewListItem = ({
  item,
  onShare,
  onDownload,
}: TimetableOverviewListItemProps) => {
  return (
    <ListItem
      className="timetable-overview-list-item"
      noHover
      noBorder
      title={item.tableName || PLANNER_CONFIGS.DEFAULT_TABLE_NAME}
      caption={
        <>
          {getMMMDDYY(item.createdAt)}
          {getExpire(item.mode, item.expire)}
        </>
      }
    >
      <span className="btn-container center-row">
        <IconButton
          size="small"
          color="primary"
          onClick={() => onDownload(item.id)}
        >
          <AiOutlineCloudDownload />
        </IconButton>
        {item.mode === TimetableOverviewMode.SHARE && (
          <IconButton
            size="small"
            color="primary"
            onClick={() => onShare(item.id)}
          >
            <AiOutlineShareAlt />
          </IconButton>
        )}
      </span>
    </ListItem>
  );
};

const TimetableOverviewCard = () => {
  const history = useHistory();
  const [expanded, setExpanded] = useState(false);
  const view = useContext(ViewContext);
  const [
    getUserTimetable,
    { data: userTimetable, loading: userTimetableLoading },
  ] = useLazyQuery(GET_USER_TIMETABLES, {
    onCompleted: async (data) => {
      console.log(data);
    },
    onError: view.handleError,
  });
  useEffect(() => {
    if (expanded && !userTimetableLoading && !userTimetable) {
      getUserTimetable();
    }
  }, [expanded]);

  const onDownload = (id: string) => {
    history.push(`/planner/share/${id}`);
  };
  const onShare = (id: string) => {
    copy(generateTimetableURL(id));
    view.setSnackBar('Copied share link!');
  };

  const renderChildren = () => {
    if (userTimetableLoading) {
      return <Loading />;
    }
    if (
      !userTimetable ||
      !userTimetable?.me ||
      (!userTimetable.me.sharedTimetables && !userTimetable.me.timetables)
    ) {
      return <ErrorCard mode={ErrorCardMode.NULL} />;
    }
    return getCombinedTimetable(userTimetable)
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
      .map((item) => (
        <TimetableOverviewListItem
          key={`${item.createdAt}${item.id}`}
          item={item}
          onShare={onShare}
          onDownload={onDownload}
        />
      ));
  };
  return (
    <AccordionCard
      className="timetable-overview"
      expanded={expanded}
      onChange={(e, expanded) => setExpanded(expanded)}
      title="Remote"
    >
      {renderChildren()}
    </AccordionCard>
  );
};

export default TimetableOverviewCard;
