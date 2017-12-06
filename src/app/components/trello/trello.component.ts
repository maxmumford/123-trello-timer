import { Component, OnInit } from '@angular/core';
import { dirname } from 'path';
import { HttpClient } from '@angular/common/http';
import { TrelloBoard, TrelloService } from 'app/services/trello.service';
import { Router } from '@angular/router';

import {remote, BrowserWindow} from "electron"
import * as querystring from "querystring"

@Component({
  selector: 'timey-trello',
  templateUrl: './trello.component.html',
  styleUrls: ['./trello.component.scss']
})
export class TrelloComponent implements OnInit {
  
  requestSecret: string
  trelloWindow: Electron.BrowserWindow

  constructor(
    private http: HttpClient,
    private router: Router,
    private trelloService: TrelloService
  ) {}

  ngOnInit(){

    let token = localStorage.getItem("token")
    let tokenSecret = localStorage.getItem("tokenSecret")

    if(!token && !tokenSecret)
      this.getRequestToken2()
    else
      this.router.navigate(['/'])
  }

  getRequestToken2(){
    
    // open window without node integration so jquery attaches itself to window on loaded trello pages
    this.trelloWindow = new remote.BrowserWindow({width: 800, height: 800, webPreferences: {nodeIntegration: false}})
    
    this.trelloWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
      
      // on redirect, check if we're going to a local file, and extract the token from the requested url, cache it and close the window
      // navigate back to home page
      if(new URL(newUrl).protocol == "file:"){
        let token = newUrl.split("token=")[1]
        this.trelloService.setToken(token)
        this.trelloWindow.close()
        this.router.navigate(['/'])
      }

    }.bind(this))

    this.trelloWindow.loadURL(TrelloService.AUTH_URL)
  }

}
