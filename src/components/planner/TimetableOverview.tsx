import { useState, useEffect, FC } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  InputBase,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import { Check, Edit, ExpandMore, Timer } from '@material-ui/icons';

import { useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';
import { AiOutlineDelete, AiOutlineShareAlt } from 'react-icons/ai';
import clsx from 'clsx';
import pluralize from 'pluralize';
import { usePlanner, useView } from '../../store';
import styles from '../../styles/components/planner/TimetableOverview.module.scss';
import {
  TimetableOverviewMode,
  TimetableOverviewWithMode,
  UserData,
} from '../../types';
import { PLANNER_CONFIGS } from '../../constants/configs';
import { GET_USER_TIMETABLES } from '../../constants/queries';
import Loading from '../atoms/Loading';
import ListItem from '../molecules/ListItem';
import { getMMMDDYY } from '../../helpers/getTime';
import { generateTimetableURL } from './PlannerTimetable';

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

type TimetableOverviewListItemProps = {
  item: TimetableOverviewWithMode;
  onShare: (id: string) => void;
  onDelete: (id: string, expire: number) => void;
  onClick: () => void;
  selected: boolean;
};

export const TimetableOverviewListItem: FC<TimetableOverviewListItemProps> = ({
  item,
  onShare,
  onDelete,
  onClick,
  selected,
}) => {
  const menuItems = [
    {
      label: 'Delete',
      action: () => onDelete(item._id, item.expire),
      icon: <AiOutlineDelete />,
    },
  ];
  if (item.mode !== TimetableOverviewMode.UPLOAD) {
    menuItems.unshift({
      label: 'Share',
      action: () => onShare(item._id),
      icon: <AiOutlineShareAlt />,
    });
  }
  return (
    <MenuItem selected={selected} className={styles.menuItem}>
      <ListItem
        className={styles.ttOverviewListItem}
        noHover
        noBorder
        title={item.tableName || PLANNER_CONFIGS.DEFAULT_TABLE_NAME}
        onClick={onClick}
        caption={
          <>
            {getMMMDDYY(item.createdAt)}
            {getExpire(item.mode, item.expire)}
          </>
        }
      >
        <span className={clsx(styles.btnContainer, 'center-row')}>
          {menuItems.map(item => (
            <IconButton
              key={item.label}
              size="small"
              color="primary"
              onClick={e => {
                e.stopPropagation();
                item.action();
              }}
            >
              {' '}
              {item.icon}
            </IconButton>
          ))}
        </span>
      </ListItem>
    </MenuItem>
  );
};

export type TimetableOverviewProps = {
  createTimetable: () => any;
  switchTimetable: (id: string) => any;
  deleteTable?: (id: string, expire: number) => any;
};

const TimetableOverview: FC<TimetableOverviewProps> = ({
  deleteTable,
  createTimetable,
  switchTimetable,
}) => {
  const view = useView();
  const planner = usePlanner();
  const [labelInput, setLabelInput] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  /* For each click, update the planner name input field */
  useEffect(() => {
    if (anchorEl) {
      setLabelInput(planner?.plannerName);
    }
  }, [anchorEl]);
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
  const onShare = (id: string) => {
    copy(generateTimetableURL(id));
    view.setSnackBar('Copied share link!');
  };

  return (
    <>
      <Button
        size="small"
        onClick={e => [setAnchorEl(e.currentTarget), getUserTimetable()]}
        endIcon={<ExpandMore />}
      >
        {planner.plannerName || PLANNER_CONFIGS.DEFAULT_TABLE_NAME}
      </Button>
      <Menu
        className={styles.timetableSelectionMenu}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <h4 className="subheading">Title</h4>
        <form
          className={styles.timetableLabelInputContainer}
          onSubmit={e => {
            e.preventDefault();
            planner.updateStore('plannerName', labelInput);
            // update the remoteTimetable data as well
            const idx = planner.remoteTimetableData.findIndex(
              d => d._id === planner.plannerId
            );
            if (idx >= 0) {
              planner.remoteTimetableData[idx].tableName = labelInput;
            }
          }}
        >
          <InputBase
            placeholder="Enter Label"
            value={labelInput}
            onChange={e => {
              setLabelInput(e.target.value);
            }}
            inputProps={{ 'aria-label': 'search' }}
          />
          <IconButton type="submit" size="small">
            {labelInput === planner.plannerName ? <Edit /> : <Check />}
          </IconButton>
        </form>
        <Divider />
        <h4 className="subheading">Timetables</h4>
        {!planner.remoteTimetableData ? (
          <Loading />
        ) : (
          planner.remoteTimetableData.map(item => (
            <TimetableOverviewListItem
              key={`${item.createdAt}${item._id}`}
              item={item}
              onShare={onShare}
              onDelete={deleteTable}
              onClick={() => {
                switchTimetable(item._id);
                setAnchorEl(null);
              }}
              selected={planner.plannerId === item._id}
            />
          ))
        )}
        <Divider />
        <MenuItem onClick={() => [createTimetable(), setAnchorEl(null)]}>
          Create New
        </MenuItem>
      </Menu>
    </>
  );
};

export default observer(TimetableOverview);
