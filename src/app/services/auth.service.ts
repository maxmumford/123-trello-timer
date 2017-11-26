import { Injectable } from '@angular/core';

import * as storage from "electron-json-storage"
import { TrelloAuthPayload } from 'app/services/trello.service';

@Injectable()
export class AuthService {

  constructor(){}

  getTrelloToken(
    callback: (auth: TrelloAuthPayload) => void
  ){
    storage.get('token', function(error, data) {
      if (error) throw error;
      let token = data.token
      let tokenSecret = data.tokenSecret
      callback({token, tokenSecret})
    })
  }

  removeTrelloToken(
    callback: () => void
  ){
    storage.remove("token", (error) => {
      if(error) throw error;
      callback()
    })
  }
  
}
