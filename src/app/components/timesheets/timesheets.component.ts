import { Component, OnInit, ViewChild, OnDestroy, EventEmitter, Input } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"

import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service'
import { AppComponent } from 'app/app.component';
import { TrackService, TimesheetModel, Timesheet } from 'app/services/track.service';
import { MatSelectionList, MatSnackBar } from '@angular/material';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subscription } from 'rxjs/Subscription';

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
  
  @Input()
  boardChanged: EventEmitter<TrelloBoard>

  constructor(
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
      })
    this.getTimesheets()

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

  ngOnDestroy(){
    this.unsubscribe()
  }

  unsubscribe(){
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  getCardNameByCardId(idCard: string){
    let card = this.getCardById(idCard)
    return card != null ? card.name : ""
  }

  showFab(){
    return this.timesheetsSelected().length > 0
  }

  invoice(){
    this.timesheetsSelected().forEach(timesheet => {
      this.trackService.markTimesheetInvoiced(timesheet.id)
      timesheet['selected'] = false
    })
  }

  export(){
    
  }

  delete(timesheet: TimesheetModel){
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

  private updateTimesheetsUninvoiced(){
    this.timesheetsUninvoiced = this.timesheets.filter(t => !t.invoiced)
  }

  private timesheetsSelected(){
    return this.timesheets.filter(t => t['selected'])
  }

  private getCardById(idCard: string){
    for(let card of this.cards){
      if(card.id == idCard)
        return card
    }
    return null
  }

}
