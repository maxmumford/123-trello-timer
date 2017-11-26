import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MatButtonModule, MatIconModule, MatToolbarModule, MatListModule} from '@angular/material';

import { AppComponent } from './app.component';
import { BoardsListComponent } from './components/boards/boards-list.component';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './services/electron.service';
import { AfkService } from 'app/services/afk.service';
import { AuthService } from 'app/services/auth.service';
import { TrelloService } from 'app/services/trello.service';
import { BoardComponent } from 'app/components/boards/board.component';
import { TrackComponent } from 'app/components/track/track.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardsListComponent,
    BoardComponent,
    TrackComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,

    // material after browser module
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule
  ],
  providers: [
    ElectronService,
    AuthService,
    AfkService,
    TrelloService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
