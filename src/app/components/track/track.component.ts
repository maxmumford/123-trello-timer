import { Component, OnInit } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"

import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service'
import { AppComponent } from 'app/app.component';
import { TrackService } from 'app/services/track.service';

@Component({
  selector: 'timey-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {

  user: TrelloUser
  boards: TrelloBoard[]
  cards: TrelloCard[]

  viewMode: "timer" | "timesheets" = "timer"

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trello: TrelloService,
    private trackService: TrackService
  ) { }

  ngOnInit() {

    this.trello.getUser().subscribe(response => {
      this.user = response

      this.trello.getBoards(this.user.id).subscribe(boards => {
        this.boards = boards
      })
    })

  }

  selectBoard(board: TrelloBoard){
    this.trackService.selectedBoard = board
    this.getCards()
  }

  selectCard(card: TrelloCard){
    this.trackService.selectedCard = card
  }

  getCards(){
    this.trello.getCards(this.trackService.selectedBoard.id).subscribe(response => {
      this.cards = response
    })
  }

  /**
   * Activate View Timesheet mode, which shows timesheets instead of cards in this board
   */
  viewTimesheets(){
    this.viewMode = "timesheets"
  }

  viewCards(){
    this.viewMode = "timer"
  }

}
