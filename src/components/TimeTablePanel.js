import React, { useContext, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';
import { NotificationContext } from '../store';
import { observer } from 'mobx-react-lite';

import './TimeTablePanel.css';
import CourseList from './planner/CourseList';
import copyToClipboard from '../helpers/copyToClipboard';

const MODAL_MODES = {
  NO_MODAL: 0,
  IMPORT_MODAL: 1,
  EXPORT_MODAL: 2,
}

const TimeTablePanel = ({ title, courses, onImport, onExport, onClear }) => {
  const notification = useContext(NotificationContext);
  const [modalMode, setModalMode] = useState(MODAL_MODES.NO_MODAL);
  const [importInput, setImportInput] = useState('');

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
    <div className="panel time-table-panel column">
      <header className="center-row">
        <span className="title">{title}</span>
        <div className="btn-row center-row">
          {
            FUNCTION_BUTTONS.map(item => (
              <Button onClick={item.action}>
                {item.label}
              </Button>
            ))
          }
        </div>
      </header>
      <CourseList courses={courses?.slice()} />

      <Dialog open={modalMode === MODAL_MODES.IMPORT_MODAL} onClose={() => setModalMode(MODAL_MODES.NO_MODAL)} aria-labelledby="form-dialog-title">
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
            onChange={e => setImportInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalMode(MODAL_MODES.NO_MODAL)} color="primary">
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
    </div>
  );
};

export default observer(TimeTablePanel);
