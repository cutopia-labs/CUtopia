import { useContext } from 'react';
import {
  Dialog as MUIDialog,
  DialogTitle,
  DialogContent,
  Switch,
  Divider,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import ListItem from '../molecules/ListItem';
import { PreferenceContext, UserContext, ViewContext } from '../../store';
import './Dialog.scss';
import { clearStore } from '../../helpers/store';
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

const ReportIssuesDialogContent = observer(() => {
  return <DialogContentTemplate title="Report Issues" caption="" />;
});

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
      {Boolean(ContentFC) && <ContentFC {...view.dialog?.contentProps} />}
    </MUIDialog>
  );
};

export default observer(Dialog);
