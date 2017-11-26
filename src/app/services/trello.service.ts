import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {HttpClient} from "@angular/common/http"
import { Router, Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot } from '@angular/router';

  import { AuthService } from 'app/services/auth.service';
  import { ElectronService } from 'app/services/electron.service';

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
  starred: boolean
}

export interface TrelloCard {
  id: string,
  name: string,
  desc: string,
  idBoard: string
}

@Injectable()
export class TrelloService implements Resolve<TrelloAuthPayload> {

  private auth: TrelloAuthPayload

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
        this.authService.getTrelloToken(auth => {
          if(auth && auth.token && auth.tokenSecret){
            this.auth = auth
            observer.next(auth)
            observer.complete()
          } else {
            this.auth = null
            this.authService.removeTrelloToken(() => {
              this.electron.loadAuthPage()
              observer.next(null)
              observer.complete()
            })
          }
        })
      })
  }

  getUser(): Observable<TrelloUser> {
    return this.http.get<TrelloUser>(this.addAuthSuffix(`https://api.trello.com/1/members/me`))
  }
  
  getBoards(userId: string){
    return this.http.get<TrelloBoard[]>(this.addAuthSuffix(`https://api.trello.com/1/members/${userId}/boards`))
  }
  
  getBoard(boardId: string){
    return this.http.get<TrelloBoard>(this.addAuthSuffix(`https://api.trello.com/1/boards/${boardId}`))
  }
  
  getCards(boardId: string){
    return this.http.get<TrelloCard[]>(this.addAuthSuffix(`https://api.trello.com/1/boards/${boardId}/cards`))
  }
  
  getCard(cardId: string){
    return this.http.get<TrelloCard>(this.addAuthSuffix(`https://api.trello.com/1/cards/${cardId}`))
  }

  private addAuthSuffix(url, noExistingQueryString = true){
    if(noExistingQueryString)
      return url + `?key=${CONSUMER_KEY}&token=${this.auth.token}`
    else
      return url + `&key=${CONSUMER_KEY}&token=${this.auth.token}`
  }
  
}
