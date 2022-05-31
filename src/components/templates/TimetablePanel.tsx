import { useState, FC } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import copy from 'copy-to-clipboard';
import clsx from 'clsx';
import { AiOutlineDelete, AiOutlineShareAlt } from 'react-icons/ai';
import { usePlanner, useView } from '../../store';
import styles from '../../styles/components/templates/TimetablePanel.module.scss';
import Timetable from '../planner/Timetable';
import Card from '../atoms/Card';

import TimetableOverview, {
  TimetableOverviewProps,
} from '../planner/TimetableOverview';

enum MODAL_MODES {
  NO_MODAL,
  IMPORT_MODAL,
  EXPORT_MODAL,
}

type TimetablePanelProps = {
  onShare?: (...args: any[]) => any;
  className?: string;
} & TimetableOverviewProps;

const TimetablePanel: FC<TimetablePanelProps> = ({
  onShare,
  deleteTable,
  className,
  updateTimetable,
  createTimetable,
}) => {
  const view = useView();
  const planner = usePlanner();
  const [modalMode, setModalMode] = useState(MODAL_MODES.NO_MODAL);
  const [importInput, setImportInput] = useState('');
  const courses = planner.plannerCourses
    ?.concat(planner.previewPlannerCourse)
    .filter(course => course);
  const timetableInfo = planner.timetableInfo;
  const onImport = parsedData =>
    planner.updateStore('plannerCourses', parsedData);

  const onClear = () => planner.clearPlannerCourses();

  const FUNCTION_BUTTONS = [
    {
      action: () => {
        if (!onShare) {
          const result = copy(JSON.stringify(courses));
          view.setSnackBar(
            result
              ? 'Copied the timetable to clipboard!'
              : 'Failed to copy QAQ, please report the issue to us'
          );
        } else {
          onShare(courses);
        }
      },
      icon: <AiOutlineShareAlt />,
      key: 'share',
    },
    {
      key: 'Clear',
      action: () => {
        onClear();
      },
      icon: <AiOutlineDelete />,
    },
  ];
  return (
    <Card className={clsx(styles.timetablePanel, 'panel column', className)}>
      <header className="center-row">
        <TimetableOverview
          updateTimetable={updateTimetable}
          deleteTable={deleteTable}
          createTimetable={createTimetable}
        />
        {Boolean(courses?.length) && (
          <div className={clsx(styles.btnRow, 'center-row')}>
            {FUNCTION_BUTTONS.map(item => (
              <IconButton key={item.key} size="small" onClick={item.action}>
                {item.icon}
              </IconButton>
            ))}
          </div>
        )}
      </header>
      <Timetable
        courses={(courses?.slice() || []) as any}
        timetableInfo={timetableInfo}
      />
      <Dialog
        open={modalMode === MODAL_MODES.IMPORT_MODAL}
        onClose={() => setModalMode(MODAL_MODES.NO_MODAL)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Import</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Paste the shared json string here!
            {/*
            1. Visit <a href="https://cusis.cuhk.edu.hk/psc/CSPRD/EMPLOYEE/SA/c/SSR_STUDENT_FL.SSR_COMPONENT_FL.GBL">CUSIS Timetable Page</a>
            2. Right click and select View Page Source
            3. Copy n paste to here
            */}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="JSON"
            type="text"
            fullWidth
            onChange={e => setImportInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setModalMode(MODAL_MODES.NO_MODAL)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => {
              setModalMode(MODAL_MODES.NO_MODAL);
              if (importInput) {
                onImport(JSON.parse(importInput));
              }
            }}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default observer(TimetablePanel);
