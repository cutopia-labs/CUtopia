import { makeObservable, observable, action } from 'mobx';
import { storeData, getStoreData, removeStoreItem } from '../helpers/store';

class TaskStore {
  @observable tasks;

  @observable sort;

  constructor(notificationStore) {
    this.init();
    makeObservable(this);
    this.notificationStore = notificationStore;
  }

  get notDoneTasksCount() {
    return this.tasks.filter(item => !item.done && !item.shortcut).length;
  }

  get doneTasksCount() {
    return this.tasks.filter(item => item.done && !item.shortcut).length;
  }

  @action.bound async init() {
    await this.loadFromStore();
  }

  @action async setSort(sort) {
    sort && await storeData('sort', sort);
    this.saveSort(sort || null);
  }

  @action.bound saveSort(sort) {
    this.sort = sort;
  }

  @action async loadFromStore() {
    const tasks = JSON.parse(await getStoreData('tasks'));
    this.setTasks(tasks || []);
    const sort = await getStoreData('sort');
    this.saveSort(sort || null);
  }

  @action async saveTask(task) {
    this.tasks.unshift({
      ...task,
      id: +new Date(),
    });
    await storeData('tasks', JSON.stringify(this.tasks));
  }

  @action async updateTask(task) {
    const index = this.tasks.findIndex(item => item.id === task.id);
    if (index !== -1 && JSON.stringify(this.tasks[index]) !== JSON.stringify(task)) {
      const UNDO_COPY = [...this.tasks];
      this.tasks[index] = task;
      await this.notificationStore.setSnackBar('Updated!', 'UNDO', () => {
        this.setTasks(UNDO_COPY);
      });
      await storeData('tasks', JSON.stringify(this.tasks));
    }
  }

  @action async deleteTask(id) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      const UNDO_COPY = [...this.tasks];
      this.tasks.splice(index, 1);
      await this.notificationStore.setSnackBar('1 item deleted', 'UNDO', () => {
        this.setTasks(UNDO_COPY);
      });
      // Update AsyncStorage after undo valid period passed.
      await storeData('tasks', JSON.stringify(this.tasks));
    }
    else {
      this.notificationStore.setSnackBar('Error...');
    }
  }

  @action async markAsDone(id) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      const UNDO_COPY = [...this.tasks];
      const newTask = {
        ...this.tasks[index],
        done: !this.tasks[index].done,
      };
      this.tasks[index] = newTask;
      if (newTask.done) {
        await this.notificationStore.setSnackBar('1 item markded as complete', 'UNDO', () => {
          this.setTasks(UNDO_COPY);
        });
      }
      await storeData('tasks', JSON.stringify(this.tasks));
    }
    else {
      console.warn('Error');
    }
  }

  @action async clearTasks({ mode }) {
    const UNDO_COPY = [...this.tasks];
    let tasks = [];
    switch (mode) {
      case null: {
        break;
      }
      case 'done': {
        tasks = [...this.tasks.filter(item => !item.done)];
        if (!(this.tasks.length - tasks.length)) {
          this.notificationStore.setSnackBar('Nothing to clear~');
          return;
        }
      }
    }
    this.setTasks(tasks);
    await this.notificationStore.setSnackBar('Cleared!', 'UNDO', () => {
      this.setTasks(UNDO_COPY);
    });
    tasks.length ? (await storeData('tasks', JSON.stringify(this.tasks))) : await removeStoreItem('tasks');
  }

  @action.bound setTasks(tasks) {
    this.tasks = tasks;
  }
}

export default TaskStore;
