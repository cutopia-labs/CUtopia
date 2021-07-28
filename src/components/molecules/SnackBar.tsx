import { useContext, useEffect, useState } from 'react';
import { Button, Portal } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

import './SnackBar.scss';
import { Alert } from '@material-ui/lab';
import { NotificationContext } from '../../store';

const SnackBar = () => {
  const notification = useContext(NotificationContext);
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    setButtonClicked(false);
  }, [notification.snackbar.id]);

  return (
    <Portal>
      {Boolean(notification.snackbar.message) && (
        <Alert
          className="snackbar-container"
          severity={notification.snackbar.severity}
          action={
            Boolean(
              notification.snackbar.label && notification.snackbar.onClick
            ) && (
              <Button
                color="secondary"
                className="btn-container"
                onClick={() => {
                  notification.snackbar.onClick();
                  setButtonClicked(true);
                }}
                disabled={buttonClicked}
              >
                {buttonClicked ? (
                  <Check color="secondary" className="snackbar-check-icon" />
                ) : (
                  notification.snackbar.label
                )}
              </Button>
            )
          }
        >
          {notification.snackbar.message}
        </Alert>
      )}
    </Portal>
  );
};

export default observer(SnackBar);
