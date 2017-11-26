import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {HttpClient} from "@angular/common/http"

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

@Injectable()
export class TrelloService {

  constructor(
    private http: HttpClient
  ){}

  getUser(auth: TrelloAuthPayload): Observable<TrelloUser> {
    return this.http.get<TrelloUser>(`https://api.trello.com/1/members/me?key=${CONSUMER_KEY}&token=${auth.token}`)
  }
  
  getBoards(auth: TrelloAuthPayload, userId: string){
    return this.http.get(`https://api.trello.com/1/members/${userId}/boards?key=${CONSUMER_KEY}&token=${auth.token}`)
  }
  
}
