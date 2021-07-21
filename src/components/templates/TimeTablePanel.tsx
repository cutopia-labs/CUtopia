import { useContext, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  TextField,
  Divider,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import { NotificationContext } from '../../store';
import './TimeTablePanel.scss';
import CourseList from '../planner/CourseList';
import copyToClipboard from '../../helpers/copyToClipboard';
import Card from '../atoms/Card';
import { CourseTableEntry, PlannerCourse, PlannerItem } from '../../types';
import clsx from 'clsx';
import { PLANNER_CONFIGS } from '../../constants/configs';
import { ExpandMore } from '@material-ui/icons';

enum MODAL_MODES {
  NO_MODAL,
  IMPORT_MODAL,
  EXPORT_MODAL,
}

type TimeTablePanelProps = {
  title?: string;
  selections?: PlannerItem[];
  selected?: PlannerItem;
  onSelect?: (selected: any) => any;
  courses?: CourseTableEntry[] | PlannerCourse[];
  previewCourse?: CourseTableEntry | PlannerCourse;
  onImport?: (...args: any[]) => any;
  onExport?: (...args: any[]) => any;
  onClear?: (...args: any[]) => any;
  className?: string;
};

const TimeTablePanel = ({
  title,
  courses,
  previewCourse,
  onImport,
  onExport,
  onClear,
  selections,
  selected,
  onSelect,
  className,
}: TimeTablePanelProps) => {
  const notification = useContext(NotificationContext);
  const [modalMode, setModalMode] = useState(MODAL_MODES.NO_MODAL);
  const [importInput, setImportInput] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const FUNCTION_BUTTONS = [
    {
      label: 'import',
      action: () => setModalMode(MODAL_MODES.IMPORT_MODAL),
    },
    {
      label: 'export',
      action: () => {
        copyToClipboard(JSON.stringify(courses));
        notification.setSnackBar('Copied the timetable to clipboard!');
      },
    },
    {
      label: 'clear',
      action: onClear,
    },
  ];

  return (
    <Card className={clsx('panel time-table-panel column', className)}>
      <header className="center-row">
        {selections?.length ? (
          <>
            <Button
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<ExpandMore />}
            >
              {selected.label || PLANNER_CONFIGS.DEFAULT_TABLE_NAME}
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {selections.map((item) => (
                <MenuItem
                  key={item.key}
                  onClick={() => [onSelect(item.key), setAnchorEl(null)]}
                  selected={selected.key === item.key}
                >
                  {item.label}
                </MenuItem>
              ))}
              <Divider />
              <MenuItem
                onClick={() => [onSelect(+new Date()), setAnchorEl(null)]}
              >
                Create New
              </MenuItem>
            </Menu>
          </>
        ) : (
          <span className="title">{title}</span>
        )}
        <div className="btn-row center-row">
          {FUNCTION_BUTTONS.map((item) => (
            <Button key={item.label} onClick={item.action}>
              {item.label}
            </Button>
          ))}
        </div>
      </header>
      <CourseList
        courses={courses?.slice() as any}
        previewCourse={previewCourse as any}
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
            1. Visit <a href="https://cusis.cuhk.edu.hk/psc/CSPRD/EMPLOYEE/SA/c/SSR_STUDENT_FL.SSR_COMPONENT_FL.GBL">CUSIS TimeTable Page</a>
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
            onChange={(e) => setImportInput(e.target.value)}
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

export default observer(TimeTablePanel);
