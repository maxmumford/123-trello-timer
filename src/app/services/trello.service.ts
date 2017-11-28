import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {HttpClient} from "@angular/common/http"
import { Router, Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot } from '@angular/router';

import { AuthService } from 'app/services/auth.service';
import { ElectronService } from 'app/services/electron.service';

import * as storage from "electron-json-storage"
storage.setDataPath(storage.getDefaultDataPath() + "/timey")
  
const CONSUMER_KEY = 'b4946565adec1d8fe0fe0b8c803bf2bc'

export interface TrelloAuthPayload  {
  token: string
  tokenSecret: string
}

export interface TrelloUser {
  id: string,
  username: string
  fullName: string
}

export interface TrelloBoard {
  id: string,
  name: string,
  hourlyRate?: number
}

export interface TrelloCard {
  id: string,
  name: string,
  desc?: string,
  idBoard?: string
}

@Injectable()
export class TrelloService implements Resolve<TrelloAuthPayload> {

  private auth: TrelloAuthPayload
  private storageKey = "token"

  constructor(
    private http: HttpClient,
    private electron: ElectronService,
    private authService: AuthService
  ){}
  
  /**
   * Prelaod and cache trello authentication token. If not found, load authentication flow
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TrelloAuthPayload> {
    if(this.auth != null && this.auth.token && this.auth.tokenSecret)
      return Observable.create(observer => {
        observer.next(this.auth)
        observer.complete()
      })
    else
      return Observable.create(observer => {
        this.getTrelloToken(auth => {
            this.auth = auth
            observer.next(auth)
            observer.complete()
          }, () => {
            this.auth = null
            this.electron.loadAuthPage()
            observer.next(null)
            observer.complete()
          }
        )
      })
  }

  getTrelloToken(
    success: (auth: TrelloAuthPayload) => void,
    fail: () => void
  ){
    storage.get(this.storageKey, function(error, data) {
      if (error) throw error;
      else if(!data || !data.token || !data.tokenSecret)
        fail()
      else {
        let token = data.token
        let tokenSecret = data.tokenSecret
        success({token, tokenSecret})
      }
    })
  }

  removeTrelloToken(
    callback: () => void
  ){
    storage.remove(this.storageKey, (error) => {
      if(error) throw error;
      else callback()
    })
  }

  getUser(): Observable<TrelloUser> {
    return this.http.get<TrelloUser>(this.addAuthSuffix(`https://api.trello.com/1/members/me`))
  }
  
  getBoards(idUser: string){
    return this.http.get<TrelloBoard[]>(this.addAuthSuffix(`https://api.trello.com/1/members/${idUser}/boards`))
  }
  
  getBoard(idBoard: string){
    return this.http.get<TrelloBoard>(this.addAuthSuffix(`https://api.trello.com/1/boards/${idBoard}`))
  }
  
  getCards(idBoard: string){
    return this.http.get<TrelloCard[]>(this.addAuthSuffix(`https://api.trello.com/1/boards/${idBoard}/cards`))
  }
  
  getCard(idCard: string){
    return this.http.get<TrelloCard>(this.addAuthSuffix(`https://api.trello.com/1/cards/${idCard}`))
  }

  private addAuthSuffix(url, noExistingQueryString = true){
    if(noExistingQueryString)
      return url + `?key=${CONSUMER_KEY}&token=${this.auth.token}`
    else
      return url + `&key=${CONSUMER_KEY}&token=${this.auth.token}`
  }
  
}
