import appStore from '../stores/appStore';
import { App, TFile } from 'obsidian';

class FileService {
  public initialized = false;

  public getState() {
    return appStore.getState().fileState;
  }

  public async updateFiles(file: TFile, isDelete: boolean) {
    const files = this.getState().files;
    const index = files.findIndex((f) => f.path === file.path);
    if (index > -1) {
      if (isDelete) {
        files.splice(index, 1);
      } else {
        files[index] = file;
      }
    }
    appStore.dispatch({
      type: 'SET_FILES',
      payload: {
        files,
      },
    });
    return files;
  }

  public async updateFilesBatch(files: TFile[]) {
    for (const file of files) {
      await this.updateFiles(file, false);
    }
  }

  public async setFiles(files: TFile[]) {
    appStore.dispatch({
      type: 'SET_FILES',
      payload: {
        files,
      },
    });
  }

  public async getFiles(app: App) {
    const files = app.vault.getFiles();
    const canvasFiles = files.filter((f) => f.extension === 'canvas');

    appStore.dispatch({
      type: 'SET_FILES',
      payload: {
        files: canvasFiles,
      },
    });
    return canvasFiles;
  }
}

const dailyNotesService = new FileService();

export default dailyNotesService;
