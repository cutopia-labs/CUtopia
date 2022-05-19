import { useEffect, useState } from 'react';
import { Button, Portal } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

import { Alert } from '@material-ui/lab';
import styles from '../../styles/components/molecules/SnackBar.module.scss';
import { useView } from '../../store';

const SnackBar = () => {
  const view = useView();
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    setButtonClicked(false);
  }, [view.snackbar.snackbarId]);

  return (
    <Portal>
      {Boolean(view.snackbar.message) && (
        <Alert
          className={styles.snackbarContainer}
          severity={view.snackbar.severity}
          action={
            Boolean(view.snackbar.label && view.snackbar.onClick) && (
              <Button
                color="inherit"
                className={styles.snackButton}
                onClick={() => {
                  view.snackbar.onClick();
                  setButtonClicked(true);
                }}
                disabled={buttonClicked}
              >
                {buttonClicked ? (
                  <Check color="secondary" />
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
