import { Component, OnInit, EventEmitter, Input } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"

import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service'
import { AppComponent } from 'app/app.component';
import { TrackService } from 'app/services/track.service';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'timey-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit, OnDestroy {

  cards: TrelloCard[]
  cardsUpdated = false
  cardSubscription: Subscription
  loading = true
  ngUnsubscribe: Subject<any> = new Subject()

  @Input()
  boardChanged: EventEmitter<TrelloBoard>

  constructor(
    private trello: TrelloService,
    private trackService: TrackService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    if(this.boardChanged)
      this.boardChanged.takeUntil(this.ngUnsubscribe).subscribe(() => {
        this.cardsUpdated = false
        this.cardSubscription.unsubscribe
        this.cardSubscription = null
        this.loading = true
        this.getCards()
      })
    this.getCards()
  }

  ngOnDestroy(){
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
    this.cardSubscription.unsubscribe()
  }

  getCards(){

    // load cards from firebase
    this.cardSubscription = this.trackService.getCards(this.trackService.selectedBoard.id)
        .takeUntil(this.ngUnsubscribe).subscribe(cards => {
      this.cards = cards
      this.loading = false

      if(!this.cardsUpdated){
        this.cardsUpdated = true
        this.trello.getCards(this.trackService.selectedBoard.id).takeUntil(this.ngUnsubscribe).subscribe(cardsTrello => {
          cardsTrello.forEach(cardTrello => {
            let cardFirebase = this.getCardById(cardTrello.id)
            if(cardFirebase == null || cardFirebase.name != cardTrello.name){
              this.trackService.createUpdateCard(this.trackService.selectedBoard.id, cardTrello.id, cardTrello.name, cardTrello.desc)
            }
          })
        })
      }
    }, error => {
      this.snackBar.open("An error occured while getting your cards: " + error, null, {duration: 5000})
      this.loading = false
    })
  }
  
  selectCard(card: TrelloCard){
    this.trackService.selectedCard = card
  }

  private getCardById(id: string){
    for(let card of this.cards){
      if(card.id == id)
        return card
    }
    return null
  }

}
