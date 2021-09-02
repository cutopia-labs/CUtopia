import { useLazyQuery, useMutation } from '@apollo/client';
import { useEffect, useContext, useState } from 'react';
import pluralize from 'pluralize';

import {
  AiOutlineCloudDownload,
  AiOutlineDelete,
  AiOutlineShareAlt,
} from 'react-icons/ai';
import { IconButton, MenuItem, Menu } from '@material-ui/core';
import { MoreHoriz, Timer } from '@material-ui/icons';
import copy from 'copy-to-clipboard';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { PLANNER_CONFIGS } from '../../constants/configs';
import './TimetableOverviewCard.scss';
import { GET_USER_TIMETABLES } from '../../constants/queries';
import { getMMMDDYY } from '../../helpers/getTime';
import { PlannerContext, plannerStore, ViewContext } from '../../store';
import {
  ErrorCardMode,
  TimetableOverviewMode,
  TimetableOverviewWithMode,
} from '../../types';
import AccordionCard from '../atoms/AccordionCard';
import Loading from '../atoms/Loading';
import ErrorCard from '../molecules/ErrorCard';
import ListItem from '../molecules/ListItem';
import { REMOVE_TIMETABLE } from '../../constants/mutations';
import { generateTimetableURL } from './PlannerTimetable';

const getExpire = (mode: TimetableOverviewMode, expire: number) => {
  if (mode === TimetableOverviewMode.SHARE) {
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
  return (data?.me?.timetables || [])
    .concat(
      [...(data?.me?.sharedTimetables || [])].sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : 1
      )
    )
    .map(item => ({
      ...item,
      mode: getTimetableOverviewMode(item.expire),
    }));
};

type TimetableOverviewListItemProps = {
  item: TimetableOverviewWithMode;
  onShare: (id: string) => void;
  onDownload: (id: string, createdAt: number) => void;
  onDelete: (id: string) => void;
};

const TimetableOverviewListItem = ({
  item,
  onShare,
  onDownload,
  onDelete,
}: TimetableOverviewListItemProps) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuItems = [
    {
      label: 'Delete',
      action: () => onDelete(item.id),
      icon: <AiOutlineDelete />,
    },
  ];
  if (item.mode === TimetableOverviewMode.SHARE) {
    menuItems.push({
      label: 'Share',
      action: () => onShare(item.id),
      icon: <AiOutlineShareAlt />,
    });
  }
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
          onClick={() => onDownload(item.id, item.createdAt)}
        >
          <AiOutlineCloudDownload />
        </IconButton>
        <IconButton
          size="small"
          color="primary"
          onClick={e => setAnchorEl(e.currentTarget)}
        >
          <MoreHoriz />
        </IconButton>
        <Menu
          className="timetable-more-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {menuItems.map(item => (
            <MenuItem
              key={item.label}
              onClick={() => {
                item.action();
                setAnchorEl(null);
              }}
            >
              <span className="menu-icon-container center-box">
                {item.icon}
              </span>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </span>
    </ListItem>
  );
};

const TimetableOverviewCard = () => {
  const history = useHistory();
  const [expanded, setExpanded] = useState(false);
  const view = useContext(ViewContext);
  const planner = useContext(PlannerContext);
  const [combinedTimetables, setCombinedTimetables] =
    useState<TimetableOverviewWithMode[]>(null);
  const [removeTimetable, { loading: removeTimetableLoading }] =
    useMutation(REMOVE_TIMETABLE);
  const [
    getUserTimetable,
    { data: userTimetable, loading: userTimetableLoading },
  ] = useLazyQuery(GET_USER_TIMETABLES, {
    onCompleted: async data => {
      console.log(`fetched tiemtabnle`);
      plannerStore.updateStore('remoteTimetableData', data);
    },
    onError: view.handleError,
  });
  useEffect(() => {
    if (expanded && !userTimetableLoading && !userTimetable) {
      getUserTimetable();
    }
  }, [expanded]);

  useEffect(() => {
    setCombinedTimetables(
      getCombinedTimetable(plannerStore.remoteTimetableData)
    );
  }, [plannerStore.remoteTimetableData]);

  const onDownload = (id: string, createdAt: number) => {
    // if key match (createdAt), then do not load but switch
    if (planner.validKey(createdAt)) {
      planner.updateCurrentPlanner(createdAt);
    } else {
      history.push(`/planner/share/${id}`);
    }
  };
  const onShare = (id: string) => {
    copy(generateTimetableURL(id));
    view.setSnackBar('Copied share link!');
  };
  const onDelete = async (id: string) => {
    try {
      await removeTimetable({
        variables: {
          id,
        },
      });
      setCombinedTimetables(items => [...items].filter(item => item.id !== id));
      view.setSnackBar('Deleted!');
    } catch (e) {
      // To skip remove entry in state in case of any error
      view.handleError(e);
    }
  };
  const renderChildren = () => {
    if (userTimetableLoading || !combinedTimetables) {
      return <Loading />;
    }
    if (!combinedTimetables.length) {
      return <ErrorCard mode={ErrorCardMode.NULL} />;
    }
    return combinedTimetables.map(item => (
      <TimetableOverviewListItem
        key={`${item.createdAt}${item.id}`}
        item={item}
        onShare={onShare}
        onDownload={onDownload}
        onDelete={onDelete}
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

export default observer(TimetableOverviewCard);
