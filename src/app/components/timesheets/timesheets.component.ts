import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"

import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service'
import { AppComponent } from 'app/app.component';
import { TrackService, TimesheetModel } from 'app/services/track.service';
import { MatSelectionList } from '@angular/material';
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
  selectedTimesheets: string[] = []
  subscriptions: Subscription[] = []
  timesheets: TimesheetModel[] = []
  cards: TrelloCard[] = []

  constructor(
    private afStore: AngularFirestore,
    private trackService: TrackService
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.trackService.getTimesheetsForBoard(this.trackService.selectedBoard.id).subscribe(timesheets => {
      this.timesheets = timesheets
    }))

    this.subscriptions.push(this.trackService.getCards(this.trackService.selectedBoard.id).subscribe(cards => {
      this.cards = cards
    }))
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  toggleListItemSelected(timesheet){
    if(this.selectedTimesheets.indexOf(timesheet) != -1){
      this.selectedTimesheets = this.selectedTimesheets.filter(t => t != timesheet)
    } else {
      this.selectedTimesheets.push(timesheet)
    }
  }

  getCardNameByCardId(idCard: string){
    let card = this.getCardById(idCard)
    return card != null ? card.name : ""
  }

  private getCardById(idCard: string){
    for(let card of this.cards){
      if(card.id == idCard)
        return card
    }
    return null
  }

  showFab(){
    return this.timesheets.filter(t => t['selected']).length > 0
  }

  invoice(){

  }

  export(){
    
  }

}
