import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router"
import { ElectronService } from 'app/services/electron.service';
import { TrackService } from 'app/services/track.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { TrelloService } from 'app/services/trello.service';
import { AuthService } from 'app/services/auth.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  constructor(
    private router: Router,
    private electronService: ElectronService,
    private trackService: TrackService,
    private afAuth: AngularFireAuth,
    private trelloService: TrelloService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {

    if(!electronService.ipcRenderer || !electronService.childProcess){
      throw new Error("Couldn't find electron renderer or child process!")
    }
  }

  ngOnInit(){
    if(localStorage.getItem('terms') == null){
      this.snackBar.open("By using this app you agree to the terms and conditions", "Read T&Cs", {duration: 10000}).onAction().subscribe(() => {
        this.router.navigate(['terms'])
      })
      localStorage.setItem('terms', "true")
    }
  }

  logoutTrello(){
    this.trelloService.removeTrelloToken()
    this.trelloService.goToLoginPage()
  }

  logoutTimey(){
    this.afAuth.auth.signOut().then(response => {
      this.router.navigate(['login'])
    }) 
  }

  trelloAuth(){
    this.router.navigate(['trello'])
  }

  terms(){
    this.router.navigate(['terms'])
  }
  
}
