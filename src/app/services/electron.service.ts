import { Injectable } from '@angular/core'

import { ipcRenderer, remote, dialog } from 'electron'
import * as childProcess from 'child_process'

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer
  childProcess: typeof childProcess

  constructor() {
    this.ipcRenderer = window.require('electron').ipcRenderer
    this.childProcess = window.require('child_process')
  }

  getCurrentWindow(){
    return remote.getCurrentWindow()
  }

  loadAuthPage(){
    this.getCurrentWindow().loadURL(`file://${__dirname}/auth.html`)
  }

  isElectron = () => {
    return window && window.process && window.process.type
  }

  dialog(title: string, message: string, buttons: string[], callback: (button: number) => void){
    remote.dialog.showMessageBox({
      title,
      message,
      buttons
    }, callback);
  }

}
