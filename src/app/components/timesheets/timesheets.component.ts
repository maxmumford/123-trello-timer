import { Component, OnInit, ViewChild, OnDestroy, EventEmitter, Input } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"

import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service'
import { AppComponent } from 'app/app.component';
import { TrackService, TimesheetModel, Timesheet } from 'app/services/track.service';
import { MatSelectionList, MatSnackBar, MatDialog } from '@angular/material';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subscription } from 'rxjs/Subscription';
import { TimesheetFormComponent } from 'app/components/timesheets/timesheet-form.component';
import { Helpers } from 'app/helpers';

@Component({
  selector: 'timey-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.scss']
})
export class TimesheetsComponent implements OnInit, OnDestroy {

  @ViewChild ('timesheetListControl') timesheetListControl: MatSelectionList;
  subscriptions: Subscription[] = []
  timesheets: Timesheet[] = []
  timesheetsUninvoiced: Timesheet[] = []
  cards: TrelloCard[] = []
  totalDurationFriendly: string = ""
  selectedTimesheetIds: string[] = []
  hourlyRate: number = 45
  totalAmountFriendly: string = ""
  
  @Input()
  boardChanged: EventEmitter<TrelloBoard>

  constructor(
    private dialog: MatDialog,
    private afStore: AngularFirestore,
    private trackService: TrackService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {

    if(this.boardChanged)
      this.boardChanged.subscribe(() => {
        this.unsubscribe()
        this.getTimesheets()
        this.timesheets = []
        this.hourlyRate = this.trackService.selectedBoard.hourlyRate ? this.trackService.selectedBoard.hourlyRate : 45
      })
      
    this.getTimesheets()
    this.hourlyRate = this.trackService.selectedBoard.hourlyRate ? this.trackService.selectedBoard.hourlyRate : 45

  }

  ngOnDestroy(){
    this.unsubscribe()
  }

  unsubscribe(){
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  getTimesheets(){
    this.subscriptions.push(this.trackService.getTimesheetsForBoard(this.trackService.selectedBoard.id).subscribe(timesheets => {
      this.timesheets = timesheets
      this.updateTimesheetsUninvoiced()
    }))

    this.subscriptions.push(this.trackService.getCards(this.trackService.selectedBoard.id).subscribe(cards => {
      this.cards = cards
    }))
  }
  
  invoice(){
    let timesheetIds = []
    let promises = []

    this.timesheetsSelected().forEach(timesheet => {
      promises.push(this.trackService.markTimesheetInvoiced(timesheet.id))
      this.deselectTimesheet(timesheet.id)
      timesheetIds.push(timesheet.id)
    })

    Promise.all(promises).then(() => {
      this.snackbar.open("Invoices marked as invoiced", "Undo").onAction().subscribe(() => {
        timesheetIds.forEach(id => {
          promises.push(this.trackService.markTimesheetInvoiced(id, false))
        })
      })
    }, error => {
      this.snackbar.open("An error occured", null, {duration: 5000, panelClass: "danger"})
    })
  }

  edit(timesheet: Timesheet){
    this.dialog.open(TimesheetFormComponent, {data: {
      timesheet,
      cards: this.cards
    }})
  }

  delete(timesheet: Timesheet){
    this.trackService.deleteTimesheet(timesheet.id)
    this.snackbar.open("Timesheet deleted", "Undo").onAction().take(1).subscribe(() => {
      this.trackService.createTimesheet({
        id: timesheet.id,
        idBoard: timesheet.idBoard,
        idCard: timesheet.idCard,
        startDate: timesheet.startDate,
        endDate: timesheet.endDate,
        invoiced: timesheet.invoiced ? true : false
      })
    })
  }

  private isSelected(id: string){
    return this.selectedTimesheetIds.indexOf(id) != -1
  }

  private selectTimesheet(id: string){
    if(!this.isSelected(id))
      this.selectedTimesheetIds.push(id)
  }

  private deselectTimesheet(id: string){
    if(this.isSelected(id))
      this.selectedTimesheetIds = this.selectedTimesheetIds.filter(i => i != id)
  }

  private toggleTimesheetSelected(timesheet: Timesheet){
    if(this.isSelected(timesheet.id))
      this.deselectTimesheet(timesheet.id)
    else
      this.selectTimesheet(timesheet.id)
    this.updateTotalDurationFriendly()
    this.updateTotalAmountFriendly()
  }

  private totalDurationSeconds(){
    return this.timesheetsSelected().map(timesheet => {
      return timesheet.durationSeconds()
    })
    .reduce((prev, current, index) => {
      return prev + current
    }, 0)
  }

  private updateHourlyRate(){
    this.updateTotalAmountFriendly()
    this.trackService.updateBoard(this.trackService.selectedBoard.id, {hourlyRate: this.hourlyRate})
  }
  
  private updateTotalDurationFriendly(){
    let seconds = this.totalDurationSeconds()
    this.totalDurationFriendly = Helpers.secondsToDurationFriendly(seconds)
  }

  private updateTotalAmountFriendly(){
    let seconds = this.totalDurationSeconds()
    this.totalAmountFriendly = (Math.round((((seconds / 60) / 60) * this.hourlyRate) * 100) / 100).toString()
  }
  
  private getCardNameByCardId(idCard: string){
    let card = this.getCardById(idCard)
    return card != null ? card.name : ""
  }

  private showFab(){
    return this.timesheetsSelected().length > 0
  }

  private updateTimesheetsUninvoiced(){
    this.timesheetsUninvoiced = this.timesheets.filter(t => !t.invoiced)
  }

  private timesheetsSelected(){
    return this.timesheets.filter(t => this.isSelected(t.id))
  }

  private getCardById(idCard: string){
    for(let card of this.cards){
      if(card.id == idCard)
        return card
    }
    return null
  }

}
