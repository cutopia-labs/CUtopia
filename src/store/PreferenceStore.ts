import { makeObservable, observable, action } from 'mobx';

import { storeData, getStoreData } from '../helpers/store';
import { THEME, DARK_THEME } from '../constants/colors';

class PreferenceStore {
  @observable darkTheme = false;

  @observable theme = THEME;

  constructor() {
    makeObservable(this);
  }

  @action async init() {
    await this.applyUserTheme();
  }

  @action async setDarkTheme(enabled: boolean) {
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
