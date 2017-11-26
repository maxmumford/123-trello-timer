import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router"
import { ElectronService } from 'app/services/electron.service';
import { AuthService } from 'app/services/auth.service';
import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service';

@Component({
  selector: 'timey-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  boardId: string
  board: TrelloBoard
  cards: TrelloCard[]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private electronService: ElectronService,
    private trello: TrelloService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.boardId = params['id']
      this.trello.getBoard(this.boardId).subscribe(response => {
        this.board = response

        this.trello.getCards(this.boardId).subscribe(response => {
          this.cards = response
        })
      })
    })
  }

  boards(){
    this.router.navigate([''])
  }

}
