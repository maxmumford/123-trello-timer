import { Injectable } from '@angular/core';

var mouse = require('osx-mouse')();

@Injectable()
export class AfkService {

  constructor(){}

  startMonitoring(){
    mouse.on('move', function(x, y) {
      console.log("Mouse moved to: ", x, y)
    })
  }

}
