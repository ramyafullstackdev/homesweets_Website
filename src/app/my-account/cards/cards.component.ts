import { Component } from '@angular/core';
import { OrderService } from 'src/app/order/order.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  providers:[OrderService]
})
export class CardsComponent {
  cards: any = [];

  constructor(
    private orderService: OrderService
  ){}

  ngOnInit(){
    this.orderService.getCards().then(cards => {
      this.cards = cards;
    });
  }
}
