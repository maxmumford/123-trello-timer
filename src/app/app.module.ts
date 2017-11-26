import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './services/electron.service';
import { AfkService } from 'app/services/afk.service';
import { AuthService } from 'app/services/auth.service';
import { TrelloService } from 'app/services/trello.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
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
