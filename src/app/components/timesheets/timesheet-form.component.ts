import { Component, OnInit, ViewChild, OnDestroy, EventEmitter, Input, Inject } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"

import { TrackService, TimesheetModel, Timesheet } from 'app/services/track.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { Helpers } from 'app/helpers';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { TrelloCard } from 'app/services/trello.service';

@Component({
  selector: 'timey-timesheet-form',
  templateUrl: './timesheet-form.component.html',
  styleUrls: ['./timesheet-form.component.scss']
})
export class TimesheetFormComponent implements OnInit, OnDestroy {

  timesheet: Timesheet
  cards: TrelloCard[] = []
  
  card = new FormControl()
  startDate = new FormControl(new Date())
  startTime = new FormControl(new Date())
  endDate = new FormControl(null)
  endTime = new FormControl(null)
  
  duration: string = ""
  subscriptions: Subscription[] = []

  constructor(
    public dialogRef: MatDialogRef<TimesheetFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackbar: MatSnackBar,
    private trackService: TrackService
  ) { }

  ngOnInit() {
    this.cards = this.data.cards
    this.timesheet = this.data.timesheet

    if(this.timesheet){
      this.card = new FormControl( this.cards.filter(c => c.id == this.timesheet.idCard)[0].id )
      this.startDate = new FormControl(this.timesheet.startDate)
      this.startTime = new FormControl(this.timesheet.startDate)
      this.endDate = new FormControl(this.timesheet.endDate)
      this.endTime = new FormControl(this.timesheet.endDate)
    }

    this.subscriptions.push(this.startDate.valueChanges.subscribe(() => this.updateDuration()))
    this.subscriptions.push(this.startTime.valueChanges.subscribe(() => this.updateDuration()))
    this.subscriptions.push(this.endDate.valueChanges.subscribe(() => this.updateDuration()))
    this.subscriptions.push(this.endTime.valueChanges.subscribe(() => this.updateDuration()))

    this.updateDuration()
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  getStartDateTime(){
    if(!this.startDate.value)
      return null
    let startDateTime = <Date> this.startDate.value
    startDateTime.setHours((<Date> this.startTime.value).getHours())
    startDateTime.setMinutes((<Date> this.startTime.value).getMinutes())
    return startDateTime
  }

  getEndDateTime(){
    if(!this.startDate.value)
      return null
    let endDateTime = <Date> this.endDate.value
    endDateTime.setHours((<Date> this.endTime.value).getHours())
    endDateTime.setMinutes((<Date> this.endTime.value).getMinutes())
    return endDateTime
  }
  
  updateDuration(){
    if(this.getStartDateTime() && this.getEndDateTime())
      this.duration = Helpers.secondsToDurationFriendly(Helpers.secondsBetweenDates(this.getStartDateTime(), this.getEndDateTime()))
    else 
      this.duration = ""
  }

  trim(str: string){
    if(str.length > 50)
      return str.substr(0, 50) + "..."
    return str
  }

  submit(){
    if(!this.timesheet.id)
      throw "No ID for timesheet!"
    
    if(Helpers.secondsBetweenDates(this.getStartDateTime(), this.getEndDateTime()) < 0)
      return this.snackbar.open("Make sure your start date is before your end date", null, {panelClass: "danger"})

    this.trackService.updateTimesheet({
      id: this.timesheet.id,
      idCard: this.card.value,
      startDate: this.getStartDateTime(),
      endDate: this.getEndDateTime()
    }).then(() => {
      this.snackbar.open("Timesheet updated", null, {duration: 3000})
    }).catch(error => {
      this.snackbar.open("Error updating timesheet", null, {duration: 3000, panelClass: "danger"})
    })

    this.dialogRef.close()
  }

  cancel(){
    this.dialogRef.close()
  }

}
