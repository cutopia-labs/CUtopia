import { useState, useEffect, FC } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  InputBase,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Check, Edit, ExpandMore, Timer } from '@mui/icons-material';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';
import { AiOutlineDelete, AiOutlineShareAlt } from 'react-icons/ai';
import clsx from 'clsx';

import { usePlanner, useView } from '../../store';
import styles from '../../styles/components/planner/TimetableOverview.module.scss';
import { TimetableOverviewMode, TimetableOverviewWithMode } from '../../types';
import { PLANNER_CONFIGS } from '../../config';
import ListItem from '../molecules/ListItem';
import { getDateDifference, getMMMDDYY } from '../../helpers/getTime';
import LoadingView from '../atoms/LoadingView';
import { generateTimetableURL } from './PlannerTimetable';

const getExpire = (mode: TimetableOverviewMode, expireAt: number) => {
  if (mode === TimetableOverviewMode.SHARE) {
    return (
      <>
        {' • '}
        <Timer />
        {getDateDifference(expireAt)}
      </>
    );
  }
  return '';
};

type TimetableOverviewListItemProps = {
  item: TimetableOverviewWithMode;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
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
      action: () => onDelete(item._id),
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
            {getExpire(item.mode, item.expireAt)}
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
  deleteTable?: (id: string) => any;
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
  const onShare = (id: string) => {
    if (planner.offline) {
      view.setSnackBar('Sign in to sync and share your timetable');
      router.push('/login?returnUrl=/planner');
      return;
    }
    copy(generateTimetableURL(id));
    view.setSnackBar('Copied share link!');
  };

  return (
    <>
      <Button
        size="small"
        onClick={e => {
          // Do not refetch, cuz the outdated overview may served from cache (issue #1)
          if (!planner.timetableOverviews) planner.initializePlanner();
          setAnchorEl(e.currentTarget);
        }}
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
          className={clsx(styles.timetableLabelInputContainer, 'row')}
          onSubmit={e => {
            e.preventDefault();
            planner.updateStore('plannerName', labelInput);
            // update the remoteTimetable data as well
            const idx = planner.timetableOverviews.findIndex(
              d => d._id === planner.plannerId
            );
            if (idx >= 0) {
              planner.timetableOverviews[idx].tableName = labelInput;
            }
          }}
        >
          <InputBase
            placeholder="Enter Label"
            value={labelInput}
            onKeyDown={e => e.stopPropagation()}
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
        <LoadingView loading={!planner.timetableOverviews}>
          {planner.timetableOverviews?.map(item => (
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
          ))}
        </LoadingView>
        <Divider />
        <MenuItem
          onClick={() => {
            createTimetable();
            setAnchorEl(null);
          }}
        >
          Create New
        </MenuItem>
      </Menu>
    </>
  );
};

export default observer(TimetableOverview);
