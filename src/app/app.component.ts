import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router"
import { ElectronService } from 'app/services/electron.service';
import { AfkService } from 'app/services/afk.service';
import { TrackService } from 'app/services/track.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { TrelloService } from 'app/services/trello.service';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  constructor(
    private router: Router,
    private electronService: ElectronService,
    private afkService: AfkService,
    private trackService: TrackService,
    private afAuth: AngularFireAuth,
    private trelloService: TrelloService,
    private authService: AuthService
  ) {

    if(!electronService.ipcRenderer || !electronService.childProcess){
      throw new Error("Couldn't find electron renderer or child process!")
    }
  }

  ngOnInit(){}

  logoutTrello(){
    this.trelloService.removeTrelloToken(() => {
      this.electronService.loadAuthPage()
    })
  }

  logoutTimey(){
    this.afAuth.auth.signOut().then(response => {
      this.router.navigate(['login'])
    }) 
  }
  
}
