import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrelloService } from 'app/services/trello.service';
import { TrackComponent } from 'app/components/track/track.component';

const routes: Routes = [
  {
    path: '',
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
