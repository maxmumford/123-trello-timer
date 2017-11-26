import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router"
import { ElectronService } from 'app/services/electron.service';
import { AuthService } from 'app/services/auth.service';
import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service';
import { AfkService } from 'app/services/afk.service';

@Component({
  selector: 'timey-board',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {

  cardId: string
  card: TrelloCard

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private electronService: ElectronService,
    private trello: TrelloService,
    private afk: AfkService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.cardId = params['id']
      this.trello.getCard(this.cardId).subscribe(response => {
        this.card = response
      })
    })
  }

  cards(){
    this.router.navigate(['board', this.card.idBoard])
  }

  track(){
    this.afk.startMonitoring()
  }

}
