import { Component, OnInit, EventEmitter } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"

import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service'
import { AppComponent } from 'app/app.component';
import { TrackService } from 'app/services/track.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'timey-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit, OnDestroy {

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
      this.boards = boards.sort(this.sortByStarredThenName)
      
      // now load boards from trello and create or update boards that are missing in firebase. this.boards list will update automatically.
      if(!this.boardsUpdated){
        this.boardsUpdated = true

        this.trelloService.getUser().subscribe(response => {
          this.user = response
    
          this.trelloService.getBoards(this.user.id).subscribe(boardsTrello => {
    
            boardsTrello.forEach(boardTrello => {
              let boardFirebase = this.findBoardById(boardTrello.id)
              if(this.trackService.isTrelloBoardDifferentFromFirebaseBoard(boardTrello, boardFirebase))
                this.trackService.createUpdateBoard(boardTrello.id, this.trackService.extractTrelloBoard(boardTrello))
            })
          })
        })
      }
    })

  }

  ngOnDestroy(){
    this.subscription.unsubscribe()
  }

  selectBoard(board: TrelloBoard){
    this.trackService.selectedBoard = board
    this.trackService.selectedCard = null
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

  private sortByStarredThenName(a: TrelloBoard, b: TrelloBoard){
    if(a.starred == b.starred)
      return (a.name < b.name) ? -1 : 1;
    else
      return (a.starred) ? -1 : 1;
  }

}
