import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'app/services/electron.service';
import { AuthService } from 'app/services/auth.service';
import { TrelloService, TrelloUser } from 'app/services/trello.service';

@Component({
  selector: 'timey-boards-list',
  templateUrl: './boards-list.component.html',
  styleUrls: ['./boards-list.component.scss']
})
export class BoardsListComponent implements OnInit {

  boards = null
  user: TrelloUser

  constructor(
    private auth: AuthService,
    private electronService: ElectronService,
    private trello: TrelloService
  ) { }

  ngOnInit() {

    this.trello.getUser().subscribe(response => {
      this.user = response
      this.trello.getBoards(this.user.id).subscribe(boards => {
        this.boards = boards
      })
    })

  }

  logout(){
    this.auth.removeTrelloToken(() => {
      this.electronService.loadAuthPage()
    })
  }

}
