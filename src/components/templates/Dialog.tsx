import { useContext, useReducer, useState } from 'react';
import {
  Dialog as MUIDialog,
  DialogTitle,
  DialogContent,
  Switch,
  Divider,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import clsx from 'clsx';
import { useMutation } from '@apollo/client';
import ListItem from '../molecules/ListItem';
import { PreferenceContext, UserContext, ViewContext } from '../../store';
import './Dialog.scss';
import { clearStore } from '../../helpers/store';
import { ReportCategory } from '../../types';
import { REPORT_ISSUES_MESSAGES, REPORT_MODES } from '../../constants/messages';
import Section from '../molecules/Section';
import TextField from '../atoms/TextField';
import LoadingButton from '../atoms/LoadingButton';
import { REPORT } from '../../constants/mutations';
import handleCompleted from '../../helpers/handleCompleted';
import DialogContentTemplate from './DialogContentTemplate';

const UserSettingsDialogContent = observer(() => {
  const preference = useContext(PreferenceContext);
  const user = useContext(UserContext);
  const view = useContext(ViewContext);
  console.log('Hi');
  return (
    <>
      <DialogTitle id="form-dialog-title">Settings</DialogTitle>
      <DialogContent className="settings-modal">
        <div className="toggle-row center-row">
          Dark Mode
          <Switch
            checked={preference.darkTheme}
            onChange={() => preference.setDarkTheme(!preference.darkTheme)}
            name="checkedA"
            inputProps={{ 'aria-label': 'secondary checkbox' }}
          />
        </div>
      </DialogContent>
      <ListItem
        noBorder
        className="log-out-row"
        onClick={() => {
          user.logout();
          clearStore();
        }}
        title="Reset"
      />
      <Divider />
      <ListItem
        noBorder
        className="log-out-row"
        onClick={() => {
          user.logout();
          view.setSnackBar('Successfully logged out!');
        }}
        title="Log Out"
      />
    </>
  );
});

type ReportIssuesDialogContentProps = {
  reportCategory: ReportCategory;
  id?: string;
};

const ReportIssuesDialogContent = observer(
  ({ reportCategory, id }: ReportIssuesDialogContentProps) => {
    const currentModeMessages = REPORT_MODES[reportCategory];
    const [anchorEl, setAnchorEl] = useState(null);
    const view = useContext(ViewContext);
    const [issueData, dispatchIssueData] = useReducer(
      (state, action) => ({ ...state, ...action }),
      {
        type: null,
        description: '',
        identifier: id,
      }
    );

    const [report, { loading: reportLoading }] = useMutation(REPORT, {
      onCompleted: handleCompleted(() => {}, {
        view,
        message: 'Thank you for your feedback!',
      }),
      onError: view.handleError,
    });
    const submit = async (e) => {
      e.preventDefault();
      await report({
        variables: {
          cat: reportCategory,
          ...issueData,
        },
      });
    };
    return (
      <DialogContentTemplate
        className="issue-report-dialog"
        title="Report Issues"
        caption={`${REPORT_ISSUES_MESSAGES[reportCategory]} ${id}`}
      >
        <form className="grid-auto-row" onSubmit={submit}>
          <Section title="Category">
            <div
              className={clsx(
                'term-selection-anchor input-container report-issue-category',
                issueData.type === null && 'caption'
              )}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              {currentModeMessages[issueData.type] ||
                'Please select a cetegory'}
            </div>
            <Menu
              className="category-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {Object.entries(currentModeMessages).map(
                ([category, label], i) => (
                  <MenuItem
                    key={category}
                    selected={category === issueData.type}
                    onClick={() => [
                      dispatchIssueData({ type: parseInt(category, 10) }),
                      setAnchorEl(null),
                    ]}
                  >
                    {label}
                  </MenuItem>
                )
              )}
            </Menu>
          </Section>
          <Section title="Description">
            <TextField
              className="dialog-description"
              placeholder="Please describe the issue..."
              value={issueData.description}
              Tag="textarea"
              onChangeText={(text) => dispatchIssueData({ description: text })}
            />
          </Section>
          <div className="share-btn-row center-row">
            <LoadingButton
              loading={reportLoading}
              className="share loading-btn"
              type="submit"
              disabled={issueData.type === null || !issueData.description}
            >
              Report
            </LoadingButton>
          </div>
        </form>
      </DialogContentTemplate>
    );
  }
);

const DialogContentMap = {
  userSettings: UserSettingsDialogContent,
  reportIssues: ReportIssuesDialogContent,
};

const Dialog = () => {
  const view = useContext(ViewContext);
  const ContentFC = DialogContentMap[view.dialog?.key];
  return (
    <MUIDialog
      className="settings-modal-container"
      open={Boolean(view.dialog)}
      onClose={(e, reason) => {
        view.dialog?.props?.onClose(e, reason);
        view.setDialog(null);
      }}
    >
      {Boolean(ContentFC) && (
        <ContentFC {...(view.dialog?.contentProps as any)} />
      )}
    </MUIDialog>
  );
};

export default observer(Dialog);
