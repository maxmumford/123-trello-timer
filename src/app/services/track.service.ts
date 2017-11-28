import { Injectable } from '@angular/core';
import { TrelloBoard, TrelloCard } from 'app/services/trello.service';

interface Track {
  boardName: string
  cardName: string
  trackStartDate: Date
  duration: string
}

@Injectable()
export class TrackService {

  selectedBoard: TrelloBoard
  selectedCard: TrelloCard

  tracking: boolean = false
  track: Track
  interval

  constructor(){}

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

  updateDuration(){
    let seconds = Math.round(((new Date()).getTime() - this.track.trackStartDate.getTime()) / 1000)
    this.track.duration = this.secondsToHoursMinutesSeconds(seconds)
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
