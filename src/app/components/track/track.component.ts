import { Component, OnInit, EventEmitter } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"

import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service'
import { AppComponent } from 'app/app.component';
import { TrackService } from 'app/services/track.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'timey-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {

  user: TrelloUser
  boards: TrelloBoard[]
  boardChanged = new EventEmitter<TrelloBoard>()
  loaded = false
  subscription: Subscription
  boardsUpdated = false

  viewMode: "timer" | "timesheets" = "timer"

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trelloService: TrelloService,
    private trackService: TrackService
  ) { }

  ngOnInit() {

    // load and display boards from firebase
    this.subscription = this.trackService.getBoards().subscribe(boards => {
      this.boards = boards
      
      // now load boards from trello and create or update boards that are missing in firebase. this.boards list will update automatically.
      if(!this.boardsUpdated){
        this.boardsUpdated = true

        this.trelloService.getUser().subscribe(response => {
          this.user = response
    
          this.trelloService.getBoards(this.user.id).subscribe(boardsTrello => {
    
            boardsTrello.forEach(boardTrello => {
              let boardFirebase = this.findBoardById(boardTrello.id)
              if(boardFirebase == null || boardFirebase.name != boardTrello.name)
                this.trackService.createUpdateBoard(boardTrello.id, boardTrello.name)
            })
          })
        })
      }
    })

  }

  selectBoard(board: TrelloBoard){
    this.trackService.selectedBoard = board
    this.boardChanged.emit(board)
  }

  selectCard(card: TrelloCard){
    this.trackService.selectedCard = card
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

  private findBoardById(id: string): TrelloBoard {
    for(let board of this.boards){
      if(board.id == id)
        return board
    }
    return null
  }

}
