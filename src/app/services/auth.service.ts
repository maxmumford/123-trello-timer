import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ){}

  resolve(): Resolve<firebase.User>{
    return Observable.create(observe => {
      this.afAuth.authState.take(1).subscribe(user => {
        if(user == null){
          this.router.navigate(['login'])
          observe.next(null)
          observe.complete()
        } else {
          observe.next(user)
          observe.complete()
        }
      })      
    })
  }
  
}
