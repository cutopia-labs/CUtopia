import React, { useContext, useEffect, useState } from 'react';
import { Button, Portal } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

import './SnackBar.css';
import { NotificationContext } from '../store';

const SnackBar = () => {
  const notification = useContext(NotificationContext);
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    setButtonClicked(false);
  }, [notification.snackbar.message]);

  if (notification.snackbar.message) {
    return (
      <Portal>
        <div className="snackbar-container">
          <span className="snack-text">{notification.snackbar.message}</span>
          {
            Boolean(notification.snackbar.label)
            && (
              <Button
                color="secondary"
                className="btn-container"
                onClick={() => {
                  notification.snackbar.onClick();
                  setButtonClicked(true);
                }}
                disabled={buttonClicked}
              >
                {buttonClicked ? <Check color="secondary" className="snackbar-check-icon" /> : notification.snackbar.label}
              </Button>
            )
          }
        </div>
      </Portal>
    );
  }

  return null;
};

export default observer(SnackBar);
