import { Component, OnInit } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"
import { ElectronService } from 'app/services/electron.service'
import { AuthService } from 'app/services/auth.service'
import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service'
import { AfkService } from 'app/services/afk.service'
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks'
import { setInterval } from 'timers'

var mouse = require('osx-mouse')()

interface Track {
  boardName: string
  cardName: string
  trackStartDate: Date
  duration: string
}

@Component({
  selector: 'timey-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {

  user: TrelloUser
  boards: TrelloBoard[]
  cards: TrelloCard[]

  selectedBoard: TrelloBoard
  selectedCard: TrelloCard

  tracking: boolean = false
  track: Track
  interval
  viewMode: "timer" | "timesheets" = "timer"

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private electronService: ElectronService,
    private trello: TrelloService,
    private afk: AfkService
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
    this.selectedBoard = board
    this.getCards()
  }

  selectCard(card: TrelloCard){
    this.selectedCard = card
  }

  startTracking(){
    this.stopTracking()

    this.track = {
      boardName: this.selectedBoard.name,
      cardName: this.selectedCard.name,
      trackStartDate: new Date(),
      duration: "00:00"
    }
    
    this.tracking = true
    this.updateDuration()
    this.interval = setInterval(this.updateDuration.bind(this), 1000)
  }

  stopTracking(){
    clearInterval(this.interval)
    this.tracking = false
    this.interval = null
    this.track = null
  }

  getCards(){
    this.trello.getCards(this.selectedBoard.id).subscribe(response => {
      this.cards = response
    })
  }

  updateDuration(){
    let seconds = Math.round(((new Date()).getTime() - this.track.trackStartDate.getTime()) / 1000)
    this.track.duration = this.secondsToHoursMinutesSeconds(seconds)
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

  private secondsToHoursMinutesSeconds(time){   
    let hrs = ~~(time / 3600)
    let mins = ~~((time % 3600) / 60)
    let secs = time % 60

    let ret = ""

    if (hrs > 0) 
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "")

    ret += "" + mins + ":" + (secs < 10 ? "0" : "")
    ret += "" + secs
    return ret
  }

}
