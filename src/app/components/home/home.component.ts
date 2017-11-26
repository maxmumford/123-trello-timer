import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'app/services/electron.service';
import { AuthService } from 'app/services/auth.service';
import { TrelloService, TrelloUser } from 'app/services/trello.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  boards = null
  user: TrelloUser

  constructor(
    private auth: AuthService,
    private electronService: ElectronService,
    private trello: TrelloService
  ) { }

  ngOnInit() {

    this.auth.getTrelloToken(auth => {
      this.trello.getUser(auth).subscribe(response => {
        this.user = response
        this.trello.getBoards(auth, this.user.id).subscribe(boards => {
          this.boards = boards
        })
      })
    })

  }

  logout(){
    this.auth.removeTrelloToken(() => {
      this.electronService.getCurrentWindow().loadURL(`file://${__dirname}/src/auth/index.html`)
    })
  }

}
