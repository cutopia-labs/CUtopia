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

import { Check, DeleteOutline, Edit, ExpandMore } from '@material-ui/icons';

import { useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { usePlanner, useView } from '../../store';
import styles from '../../styles/components/templates/TimetablePanel.module.scss';
import {
  TimetableOverviewMode,
  TimetableOverviewWithMode,
  UserData,
} from '../../types';
import { PLANNER_CONFIGS } from '../../constants/configs';
import { GET_USER_TIMETABLES } from '../../constants/queries';

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

export type TimetableOverviewProps = {
  updateTimetable: (data: any) => any;
  createTimetable: () => any;
  deleteTable?: (id: string, expire: number) => any;
};

const TimetableOverview: FC<TimetableOverviewProps> = ({
  deleteTable,
  createTimetable,
  updateTimetable,
}) => {
  const view = useView();
  const planner = usePlanner();
  const [labelInput, setLabelInput] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  useEffect(() => {
    setLabelInput(planner?.plannerName);
  }, [planner.plannerId]);
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
  const switchTimetable = (id: string) => {
    router.push(`/planner?sid=${id}`, undefined, { shallow: true });
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
            if (labelInput !== planner.plannerName) {
              updateTimetable({
                tableName: labelInput,
              });
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
        {planner.remoteTimetableData?.map(item => (
          <MenuItem
            className={styles.timetableSelectItem}
            key={item._id}
            onClick={() => [switchTimetable(item._id), setAnchorEl(null)]}
            selected={planner.plannerId === item._id}
          >
            {item.tableName || PLANNER_CONFIGS.DEFAULT_TABLE_NAME}
            <IconButton
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                deleteTable(item._id, item.expire);
              }}
              size="small"
              color="secondary"
            >
              <DeleteOutline />
            </IconButton>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => [createTimetable(), setAnchorEl(null)]}>
          Create New
        </MenuItem>
      </Menu>
    </>
  );
};

export default observer(TimetableOverview);
