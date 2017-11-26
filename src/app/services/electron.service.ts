import { Injectable } from '@angular/core'

import { ipcRenderer, remote } from 'electron'
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
    this.getCurrentWindow().loadURL(`file://${__dirname}/src/auth/index.html`)
  }

  isElectron = () => {
    return window && window.process && window.process.type
  }

}
