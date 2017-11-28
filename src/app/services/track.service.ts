import { Injectable } from '@angular/core';
import { TrelloBoard, TrelloCard } from 'app/services/trello.service';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from 'app/services/auth.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Helpers } from 'app/helpers';

interface TrackDisplay {
  boardName: string
  cardName: string
  trackStartDate: Date
  duration: string
}

export interface TimesheetModel {
  id?: string
  idBoard?: string
  idCard?: string
  startDate: Date
  endDate: Date
}

export class Timesheet implements TimesheetModel {
  id?: string
  idBoard: string
  idCard: string
  startDate: Date
  endDate: Date

  constructor(data: TimesheetModel){
    Object.keys(data).forEach(key => {
      this[key] = data[key]
    })
  }

  durationSeconds(){
    return Math.round((this.endDate.getTime() - this.startDate.getTime()) / 1000)
  }

  durationFriendly(){
    return Helpers.secondsToDurationFriendly(this.durationSeconds())
  }
}

@Injectable()
export class TrackService {

  selectedBoard: TrelloBoard
  selectedCard: TrelloCard

  tracking: boolean = false
  track: TrackDisplay
  interval

  onStopTracking: Subject<TimesheetModel>

  constructor(
    private afStore: AngularFirestore,
    private authService: AuthService
  ){
    this.onStopTracking = new Subject()
  }

  startTracking(){
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

  /**
   * Stops tracking, then saves a new track in firebase
   */
  stopTracking(){

    clearInterval(this.interval)
    let timesheet = {
      idBoard: this.selectedBoard.id,
      idCard: this.selectedCard.id,
      startDate: this.track.trackStartDate,
      endDate: new Date()
    }

    this.tracking = false
    this.interval = null
    this.track = null
    
    this.createTimesheet(timesheet).then(done => {

      this.onStopTracking.next(timesheet)
    })
  }
  
  getTimesheetsForBoard(idBoard: string): Observable<Timesheet[]>{
    return this.afStore.collection(`users/${this.authService.user.uid}/timesheets`, ref => ref.where('idBoard', '==', idBoard)).snapshotChanges().map(timesheets => {
      return timesheets.map(timesheet => {
        return new Timesheet({
          id: timesheet.payload.doc.id,
          startDate: timesheet.payload.doc.data().startDate,
          endDate: timesheet.payload.doc.data().endDate,
          idCard: timesheet.payload.doc.data().idCard,
          idBoard: timesheet.payload.doc.data().idBoard
        })
      })
    })
  }

  createUpdateBoard(id: string, name: string){
    return this.afStore.doc(`users/${this.authService.user.uid}/boards/${id}`).set({name}, {merge: true})
  }

  getBoards(): Observable<TrelloBoard[]>{
    return this.afStore.collection(`users/${this.authService.user.uid}/boards`, ref => ref.orderBy("name")).snapshotChanges().map(boards => {
      return boards.map(board => {
        return {
          id: board.payload.doc.id,
          name: board.payload.doc.data().name
        }
      })
    })
  }

  getCards(idBoard: string): Observable<TrelloCard[]>{
    return this.afStore.collection(`users/${this.authService.user.uid}/cards/`, ref => ref.where('idBoard', '==', idBoard)).snapshotChanges().map(cards => {
      return cards.map(board => {
        return {
          id: board.payload.doc.id,
          name: board.payload.doc.data().name
        }
      })
    })
  }

  createUpdateCard(idBoard: string, idCard: string, name: string, desc: string){
    return this.afStore.doc(`users/${this.authService.user.uid}/cards/${idCard}`).set({
      id: idCard, 
      name, 
      idBoard: idBoard
    }, {merge: true})
  }

  private createTimesheet(timesheet: TimesheetModel){
    return this.myTimesheets(timesheet.idBoard, timesheet.idCard).add(timesheet)
  }

  private updateDuration(){
    let seconds = Math.round(((new Date()).getTime() - this.track.trackStartDate.getTime()) / 1000)
    this.track.duration = Helpers.secondsToClock(seconds)
  }

  private myTimesheets(idBoard: string, idCard: string): AngularFirestoreCollection<TimesheetModel> {
    return this.afStore.collection(`users/${this.authService.user.uid}/timesheets`)
  }

}
