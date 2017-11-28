import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrelloService } from 'app/services/trello.service';
import { TrackComponent } from 'app/components/track/track.component';
import { AuthService } from 'app/services/auth.service';
import { LoginComponent } from 'app/components/auth/login.component';

const routes: Routes = [
  {
    path: '',
    component: TrackComponent,
    resolve: [
      AuthService,
      TrelloService
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
