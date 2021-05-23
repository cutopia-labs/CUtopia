import React, { useContext, useEffect, useState } from 'react';
import { Button, Icon, Portal } from '@material-ui/core';
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
                className="btn-container"
                onClick={() => {
                  notification.snackbar.onClick();
                  setButtonClicked(true);
                }}
                type="clear"
                {
                  ...(
                    buttonClicked
                      ? {
                        icon:
                        <Check className="snackbar-check-icon" />,
                        disabled: true,
                      }
                      : {
                        titleStyle: [styles.buttonTitle, { color: theme.colors.accent }],
                        title: notification.snackbar.label,
                      }
                  )
                }
              />
            )
          }
        </div>
      </Portal>
    );
  }

  return null;
};

export default observer(SnackBar);
