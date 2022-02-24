import { useContext, useState, useEffect } from 'react';
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
  IconButton,
  InputBase,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import copy from 'copy-to-clipboard';
import { Check, DeleteOutline, Edit, ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import {
  AiOutlineCloudUpload,
  AiOutlineDelete,
  AiOutlineShareAlt,
} from 'react-icons/ai';
import { ViewContext } from '../../store';
import '../../styles/components/templates/TimetablePanel.scss';
import Timetable from '../planner/Timetable';
import Card from '../atoms/Card';
import {
  CourseTableEntry,
  PlannerCourse,
  PlannerItem,
  TimetableInfo,
} from '../../types';
import { PLANNER_CONFIGS } from '../../constants/configs';

enum MODAL_MODES {
  NO_MODAL,
  IMPORT_MODAL,
  EXPORT_MODAL,
}

type TimetablePanelProps = {
  title?: string;
  selections?: PlannerItem[];
  selected?: PlannerItem;
  onSelect?: (selected: any) => any;
  courses?: CourseTableEntry[] | PlannerCourse[];
  timetableInfo?: TimetableInfo;
  previewCourse?: CourseTableEntry | PlannerCourse;
  onImport?: (...args: any[]) => any;
  onUpload?: (...args: any[]) => any;
  onShare?: (...args: any[]) => any;
  onClear?: (...args: any[]) => any;
  setLabel?: (label: string) => any;
  deleteTable?: (key: number) => any;
  className?: string;
};

const TimetablePanel = ({
  title,
  courses,
  timetableInfo,
  previewCourse,
  onImport,
  onUpload,
  onShare,
  onClear,
  selections,
  selected,
  onSelect,
  setLabel,
  deleteTable,
  className,
}: TimetablePanelProps) => {
  const view = useContext(ViewContext);
  const [modalMode, setModalMode] = useState(MODAL_MODES.NO_MODAL);
  const [importInput, setImportInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    setLabelInput(selected?.label);
  }, [selected]);

  const FUNCTION_BUTTONS = [
    {
      action: () => {
        if (!onUpload) {
          const result = copy(JSON.stringify(courses));
          view.setSnackBar(
            result
              ? 'Copied the timetable to clipboard!'
              : 'Failed to copy QAQ, please report the issue to us'
          );
        } else {
          onUpload(courses);
        }
      },
      icon: <AiOutlineCloudUpload />,
      key: 'upload',
    },
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
    <Card className={clsx('panel time-table-panel column', className)}>
      <header className="center-row">
        {selections?.length ? (
          <>
            <Button
              size="small"
              onClick={e => setAnchorEl(e.currentTarget)}
              endIcon={<ExpandMore />}
            >
              {selected.label || PLANNER_CONFIGS.DEFAULT_TABLE_NAME}
            </Button>
            <Menu
              className="planner-timetable-selection-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <h4 className="subheading">Title</h4>
              <form
                className="timetable-label-input-container"
                onSubmit={e => {
                  e.preventDefault();
                  if (labelInput !== selected.label) {
                    setLabel(labelInput);
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
                  {labelInput === selected.label ? <Edit /> : <Check />}
                </IconButton>
              </form>
              <Divider />
              <h4 className="subheading">Timetables</h4>
              {selections.map(item => (
                <MenuItem
                  className="timetable-select-item"
                  key={item.key}
                  onClick={() => [onSelect(item.key), setAnchorEl(null)]}
                  selected={selected.key === item.key}
                >
                  {item.label}
                  <IconButton
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      deleteTable(item.key);
                    }}
                    size="small"
                    color="secondary"
                  >
                    <DeleteOutline />
                  </IconButton>
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
        {Boolean(courses?.length) && (
          <div className="btn-row center-row">
            {FUNCTION_BUTTONS.map(item => (
              <IconButton key={item.key} size="small" onClick={item.action}>
                {item.icon}
              </IconButton>
            ))}
          </div>
        )}
      </header>
      <Timetable
        courses={((courses?.slice() || []) as any).concat(previewCourse)}
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
