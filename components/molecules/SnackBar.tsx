import { useContext, useEffect, useState } from 'react';
import { Button, Portal } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

import '../../styles/components/molecules/SnackBar.module.scss';
import { Alert } from '@material-ui/lab';
import { ViewContext } from '../../store';

const SnackBar = () => {
  const view = useContext(ViewContext);
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    setButtonClicked(false);
  }, [view.snackbar.snackbarId]);

  return (
    <Portal>
      {Boolean(view.snackbar.message) && (
        <Alert
          className="snackbar-container"
          severity={view.snackbar.severity}
          action={
            Boolean(view.snackbar.label && view.snackbar.onClick) && (
              <Button
                color="inherit"
                className="btn-container"
                onClick={() => {
                  view.snackbar.onClick();
                  setButtonClicked(true);
                }}
                disabled={buttonClicked}
              >
                {buttonClicked ? (
                  <Check color="secondary" className="snackbar-check-icon" />
                ) : (
                  view.snackbar.label
                )}
              </Button>
            )
          }
        >
          {view.snackbar.message}
        </Alert>
      )}
    </Portal>
  );
};

export default observer(SnackBar);
