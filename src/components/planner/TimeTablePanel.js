import React, { useContext, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';
import { NotificationContext, UserContext } from '../../store';
import { observer } from 'mobx-react-lite';

import './TimeTablePanel.css';
import CourseList from './CourseList';
import courseParser from '../../parsers/courseParser';
import copyToClipboard from '../../helpers/copyToClipboard';

const MODAL_MODES = {
  NO_MODAL: 0,
  IMPORT_MODAL: 1,
  EXPORT_MODAL: 2,
}

const TimeTablePanel = () => {
  const user = useContext(UserContext);
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
        copyToClipboard(JSON.stringify(user.plannerCourses));
        notification.setSnackBar('Copied the timetable to clipboard!');
      },
    },
    {
      label: 'clear',
      action: () => user.clearPlannerCourses(),
    },
  ];
  return (
    <div className="time-table-panel column">
      <header className="center-row">
        <span className="title">My Schedule</span>
        <div className="btn-row center-row">
          {
            FUNCTION_BUTTONS.map(item => (
              <Button
                onClick={item.action}
              >
                {item.label}
              </Button>
            ))
          }
        </div>
      </header>
      <CourseList courses={user.plannerCourses.slice()} />

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
          <Button onClick={() => {
            setModalMode(MODAL_MODES.NO_MODAL)
            if(importInput){
              // const parsed = courseParser(importInput)
              const parsed = JSON.parse(importInput);
              user.setAndSavePlannerCourses(parsed);
              console.log(parsed)
              
            }
          }} color="primary">
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default observer(TimeTablePanel);
