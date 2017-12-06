import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {HttpClient} from "@angular/common/http"
import { Router, Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot } from '@angular/router';

import { AuthService } from 'app/services/auth.service';
import { ElectronService } from 'app/services/electron.service';

export interface TrelloUser {
  id: string,
  username: string
  fullName: string
}

export interface TrelloBoard {
  id?: string,
  name: string,
  hourlyRate?: number,
  backgroundImage: string,
  starred: boolean
}

export interface TrelloCard {
  id: string,
  name: string,
  desc?: string,
  idBoard?: string
}

@Injectable()
export class TrelloService implements Resolve<string> {

  private static CONSUMER_KEY = 'b4946565adec1d8fe0fe0b8c803bf2bc'
  public static AUTH_URL = `https://trello.com/1/authorize?response_type=token&key=${TrelloService.CONSUMER_KEY}`
        + `&redirect_uri=file://${__dirname}/index.html&callback_method=fragment&scope=read&expiration=never&name=123%20Trello%20Timer`
  public static LS_TOKEN = "token"

  private token: string

  constructor(
    private http: HttpClient,
    private router: Router,
    private electron: ElectronService,
    private authService: AuthService
  ){}
  
  /**
   * Prelaod and cache trello authentication token. If not found, load authentication flow
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): string {
    if(this.hasTrelloToken())
      return this.token
    else {
      this.token = null
      this.router.navigate(['trello'])
      return null
    }
  }

  hasTrelloToken(){
    this.token = this.getTrelloToken()
    return this.token
  }

  getTrelloToken(): string {
    return localStorage.getItem(TrelloService.LS_TOKEN)
  }

  setToken(token: string){
    localStorage.setItem(TrelloService.LS_TOKEN, token)
  }

  removeTrelloToken(){
    localStorage.removeItem(TrelloService.LS_TOKEN)
  }

  goToLoginPage(){
    this.router.navigate(['trello'])
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
      return url + `?key=${TrelloService.CONSUMER_KEY}&token=${this.token}`
    else
      return url + `&key=${TrelloService.CONSUMER_KEY}&token=${this.token}`
  }
  
}
