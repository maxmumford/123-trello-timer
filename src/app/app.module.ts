import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';

import 'rxjs/add/operator/take'; 

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MatButtonModule, MatIconModule, MatToolbarModule, MatListModule, MatTooltipModule,
    MatMenuModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatCardModule,
    MatCheckboxModule, 
    MatDatepickerModule,
    MatDialogModule,
    MatNativeDateModule,
    MatSelectModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { environment } from 'environments';
import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './services/electron.service';
import { AfkService } from 'app/services/afk.service';
import { AuthService } from 'app/services/auth.service';
import { TrelloService } from 'app/services/trello.service';
import { AppComponent } from './app.component';
import { TrackComponent } from 'app/components/track/track.component';
import { LoginComponent } from 'app/components/auth/login.component';
import { TrackService } from 'app/services/track.service';
import { CardsComponent } from 'app/components/card/cards.component';
import { TimesheetsComponent } from 'app/components/timesheets/timesheets.component';
import { TimesheetFormComponent } from 'app/components/timesheets/timesheet-form.component';
import { TimePickerComponent } from 'app/components/controls/timepicker.component';

@NgModule({
  declarations: [
    AppComponent,
    TrackComponent,
    LoginComponent,
    CardsComponent,
    TimesheetsComponent,
    TimesheetFormComponent,
    TimePickerComponent
  ],
  entryComponents: [
    TimesheetFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,

    // firebase
    AngularFireModule.initializeApp(environment.firebase, "Timey"),    
    AngularFireAuthModule,
    AngularFirestoreModule,

    // material after browser module
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  providers: [
    ElectronService,
    AuthService,
    AfkService,
    TrelloService,
    TrackService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
