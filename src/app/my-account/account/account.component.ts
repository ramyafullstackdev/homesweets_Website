import { Component } from '@angular/core';
import { MessageService } from 'src/app/services';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {

  constructor(private messageService: MessageService){}

  redirect(key:any ){
    let obj = {
      sideKey:key
    }
    this.messageService.sendMessage(obj);
  }
}
