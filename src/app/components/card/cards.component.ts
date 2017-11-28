import { Component, OnInit, EventEmitter, Input } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"

import { TrelloService, TrelloUser, TrelloBoard, TrelloCard } from 'app/services/trello.service'
import { AppComponent } from 'app/app.component';
import { TrackService } from 'app/services/track.service';

@Component({
  selector: 'timey-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  cards: TrelloCard[]
  cardsUpdated = false

  @Input()
  boardChanged: EventEmitter<TrelloBoard>

  constructor(
    private trello: TrelloService,
    private trackService: TrackService
  ) { }

  ngOnInit() {
    if(this.boardChanged)
      this.boardChanged.subscribe(() => {
        this.cardsUpdated = false
        this.getCards()
      })
    this.getCards()
  }

  getCards(){

    // load cards from firebase
    this.trackService.getCards(this.trackService.selectedBoard.id).subscribe(cards => {
      this.cards = cards

      if(!this.cardsUpdated){
        this.cardsUpdated = true
        this.trello.getCards(this.trackService.selectedBoard.id).subscribe(cardsTrello => {
          cardsTrello.forEach(cardTrello => {
            let cardFirebase = this.getCardById(cardTrello.id)
            if(cardFirebase == null || cardFirebase.name != cardTrello.name){
              this.trackService.createUpdateCard(this.trackService.selectedBoard.id, cardTrello.id, cardTrello.name, cardTrello.desc)
            }
          })
        })
      }
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
