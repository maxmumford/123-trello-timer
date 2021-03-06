import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';

import 'rxjs/add/operator/take'; 

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
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
import { TruncatePipe } from 'app/pipes/truncate.pipe';
import { TrelloComponent } from 'app/components/trello/trello.component';

import * as Raven from 'raven-js';
import { LoadingComponent } from 'app/components/elements/loading.component';
import { TrelloInterceptor } from 'app/interceptors/trello.interceptor';
import { TermsComponent } from 'app/components/terms/terms.component';
import { GithubService } from 'app/services/github.service';

Raven		
  .config('https://c6d33501e3b4403b92b9d8a84c1b3272@sentry.io/252885')		
  .install()

export class TrelloTimerErrorHandler implements ErrorHandler {
  handleError(err:any) : void {
    Raven.captureException(err)
    console.log(err)
  }
}

@NgModule({
  declarations: [
    AppComponent,
    TrackComponent,
    LoginComponent,
    CardsComponent,
    TimesheetsComponent,
    TimesheetFormComponent,
    TimePickerComponent,
    TrelloComponent,
    LoadingComponent,
    TermsComponent,
    TruncatePipe
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
    AngularFireModule.initializeApp(environment.firebase, "123 Trello Timer"),    
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
    TrelloService,
    TrackService,
    GithubService,

    { provide: ErrorHandler, useClass: TrelloTimerErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: TrelloInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
