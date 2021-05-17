import { makeObservable, observable, action } from 'mobx';
import { storeData, getStoreData } from '../helpers/store';


class PreferenceStore {
  constructor() {
    this.init();
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
