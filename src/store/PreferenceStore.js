import { makeObservable, observable, action } from 'mobx';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';

import { storeData, getStoreData } from '../helpers/store';

const THEME = createMuiTheme({
  palette: {
    primary: {
      main: '#8565bd',
      secondary: 'rgba(249, 169, 83, 1)',
    },
  },
});

const DARK_THEME = {
  palette: {
    primary: {
      main: '#8565bd',
      secondary: 'rgba(249, 169, 83, 1)',
    },
  },
};

class PreferenceStore {
  @observable darkTheme = false;

  @observable theme = THEME;

  constructor() {
    makeObservable(this);
  }

  @action async init() {
    await this.applyUserTheme();
  }

  @action async setDarkTheme(enabled) {
    this.darkTheme = enabled;
    this.theme = enabled ? DARK_THEME : THEME;
    await storeData('theme', enabled ? 'dark' : 'default');
  }

  @action async applyUserTheme() {
    const theme = await getStoreData('theme');
    if (theme === 'dark') {
      this.setDarkTheme(true);
    }
  }

  @action async reset() {
    await this.setDarkTheme(false);
  }
}

export default PreferenceStore;
