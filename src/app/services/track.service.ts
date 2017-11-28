import { Injectable } from '@angular/core';
import { TrelloBoard, TrelloCard } from 'app/services/trello.service';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from 'app/services/auth.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Helpers } from 'app/helpers';
import { MatSnackBar } from '@angular/material';

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
  invoiced?: boolean
}

export class Timesheet implements TimesheetModel {
  id?: string
  idBoard: string
  idCard: string
  startDate: Date
  endDate: Date
  invoiced: boolean = false

  constructor(data: TimesheetModel){
    Object.keys(data).forEach(key => {
      this[key] = data[key]
    })
  }

  durationSeconds(){
    return Helpers.secondsBetweenDates(this.startDate, this.endDate)
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
  trackId: string
  track: TrackDisplay
  intervalUpdateDuration
  intervalUpdateTrackEndDate

  onStopTracking: Subject<TimesheetModel>

  constructor(
    private afStore: AngularFirestore,
    private authService: AuthService,
    private snackbar: MatSnackBar
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
    this.intervalUpdateDuration = setInterval(this.updateDuration.bind(this), 1000) // every second
    this.intervalUpdateTrackEndDate = setInterval(this.updateTrackEndDate.bind(this), 1000 * 60) // every minute
  }

  /**
   * Stops tracking, then saves a new track in firebase
   */
  stopTracking(createOrUpdate = true){

    clearInterval(this.intervalUpdateDuration)
    clearInterval(this.intervalUpdateTrackEndDate)

    let timesheet = {
      idBoard: this.selectedBoard.id,
      idCard: this.selectedCard.id,
      startDate: this.track.trackStartDate,
      endDate: new Date()
    }

    this.tracking = false
    this.intervalUpdateDuration = null
    this.intervalUpdateTrackEndDate = null
    this.track = null
    
    if(createOrUpdate){
      if(!this.trackId){
        this.createTimesheet(timesheet).then(done => {
          this.onStopTracking.next(timesheet)
        })
      } else {
        this.updateTimesheetEndDateToNow(this.trackId)
      }
    }

    this.trackId = null
  }
  
  getTimesheetsForBoard(idBoard: string): Observable<Timesheet[]>{
    return this.afStore.collection(`users/${this.authService.user.uid}/timesheets`, ref => ref.where('idBoard', '==', idBoard).orderBy("startDate"))
        .snapshotChanges().map(timesheets => {
      return timesheets.map(timesheet => {
        return new Timesheet({
          id: timesheet.payload.doc.id,
          startDate: timesheet.payload.doc.data().startDate,
          endDate: timesheet.payload.doc.data().endDate,
          idCard: timesheet.payload.doc.data().idCard,
          idBoard: timesheet.payload.doc.data().idBoard,
          invoiced: timesheet.payload.doc.data().invoiced
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
          name: board.payload.doc.data().name,
          hourlyRate: board.payload.doc.data().hourlyRate
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

  updateBoard(idBoard: string, data){
    return this.afStore.doc(`users/${this.authService.user.uid}/boards/${idBoard}`).update(data)
  }

  markTimesheetInvoiced(idTimesheet: string, val: boolean = true){
    return this.afStore.doc(`users/${this.authService.user.uid}/timesheets/${idTimesheet}`).update({invoiced: val})
  }
  
  deleteTimesheet(idTimesheet: string){
    return this.afStore.doc(`users/${this.authService.user.uid}/timesheets/${idTimesheet}`).delete()
  }

  createTimesheet(timesheet: TimesheetModel){
    return this.myTimesheets().add(timesheet)
  }

  updateTimesheet(timesheet: TimesheetModel){
    return this.afStore.doc(`users/${this.authService.user.uid}/timesheets/${timesheet.id}`).update({
      idCard: timesheet.idCard,
      startDate: timesheet.startDate,
      endDate: timesheet.endDate
    })
  }

  updateTimesheetEndDateToNow(id: string){
    return this.afStore.doc(`users/${this.authService.user.uid}/timesheets/${id}`).update({
      endDate: new Date()
    })
  }

  /**
   * Updates the duration ui string
   */
  private updateDuration(){
    let seconds = Helpers.secondsBetweenDates(this.track.trackStartDate, new Date())
    this.track.duration = Helpers.secondsToClock(seconds)
  }

  /**
   * Updates the ongoing track's end date
   */
  private updateTrackEndDate(){
    if(this.tracking && !this.trackId){
      this.createTimesheet({
        idBoard: this.selectedBoard.id,
        idCard: this.selectedCard.id,
        startDate: this.track.trackStartDate,
        endDate: new Date()
      }).then(track => {
        this.trackId = track.id
      })
    }
    else if(this.tracking && this.trackId){
      this.updateTimesheetEndDateToNow(this.trackId).catch(error => {
        if(error.code == "not-found"){
          this.stopTracking(false)
          this.snackbar.open("It looks like you deleted the current timesheet - stopping tracking", null, {duration: 10000, panelClass: "danger"})
        }
      })
    }
  }

  private myTimesheets(): AngularFirestoreCollection<TimesheetModel> {
    return this.afStore.collection(`users/${this.authService.user.uid}/timesheets`)
  }

}
