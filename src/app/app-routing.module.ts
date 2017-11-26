import { BoardsListComponent } from './components/boards/boards-list.component';
import { BoardComponent } from './components/boards/board.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrelloService } from 'app/services/trello.service';
import { TrackComponent } from 'app/components/track/track.component';

const routes: Routes = [
  {
    path: '',
    component: BoardsListComponent,
    resolve: [
      TrelloService
    ]
  },
  {
    path: 'board/:id',
    component: BoardComponent,
    resolve: [
      TrelloService
    ]
  },
  {
    path: 'track/:id',
    component: TrackComponent,
    resolve: [
      TrelloService
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
