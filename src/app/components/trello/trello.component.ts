import { Component, OnInit } from '@angular/core';
import { dirname } from 'path';
import { HttpClient } from '@angular/common/http';
import { TrelloBoard } from 'app/services/trello.service';
import { Router } from '@angular/router';

import {remote, BrowserWindow} from "electron"
let request = require("request")
let querystring = require('querystring')

const CONSUMER_KEY = 'b4946565adec1d8fe0fe0b8c803bf2bc'
const CONSUMER_SECRET = 'a9f54fb31e4293037a73734bc9f0262e2ed8e2905c2f57b8c923f9093a6ce29c'

const REQUEST_TOKEN_URL = 'https://trello.com/1/OAuthGetRequestToken?oauth_callback=file://' + __dirname + '/index.html'
const AUTHORIZE_TOKEN_URL = 'https://trello.com/1/OAuthAuthorizeToken?name=Timey&scope=read&expiration=never&oauth_token='
const ACCESS_TOKEN_URL = 'https://trello.com/1/OAuthGetAccessToken'

@Component({
  selector: 'timey-trello',
  templateUrl: './trello.component.html',
  styleUrls: ['./trello.component.scss']
})
export class TrelloComponent implements OnInit {
  
  oauth = {
    consumer_key: CONSUMER_KEY, 
    consumer_secret: CONSUMER_SECRET
  }
  requestSecret: string
  trelloWindow: Electron.BrowserWindow

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(){

    let token = localStorage.getItem("token")
    let tokenSecret = localStorage.getItem("tokenSecret")

    if(!token && !tokenSecret)
      this.getRequestToken()
    else
      this.router.navigate(['/'])
  }

  getRequestToken(){
    
    request.post({
      url: REQUEST_TOKEN_URL, 
      oauth: this.oauth
    }, (e, r, body) => {

      const req_data = querystring.parse(body)
      const token = req_data.oauth_token
      this.requestSecret = req_data.oauth_token_secret

      this.authorizeToken(token)
    })
  }

  authorizeToken(token: string){
      
    this.trelloWindow = new remote.BrowserWindow({width: 800, height: 800})
    
    this.trelloWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
      let params = querystring.parse(newUrl.split("?")[1])
      this.getAccessToken(params.oauth_token, params.oauth_verifier)
    }.bind(this))

    this.trelloWindow.loadURL(AUTHORIZE_TOKEN_URL + token)
  }

  getAccessToken(token: string, verifier: string){
    
    const oauth = {
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET,
      token: token,
      token_secret: this.requestSecret,
      verifier: verifier,
    };
    
    request.post({
      url: ACCESS_TOKEN_URL, 
      oauth: oauth
    }, (e, r, body) => {

      const tokenData = querystring.parse(body)
      
      localStorage.setItem("token", tokenData.oauth_token)
      localStorage.setItem("tokenSecret", tokenData.oauth_token_secret)

      this.trelloWindow.close()

      this.router.navigate(['/'])
    })
  }
  
}
