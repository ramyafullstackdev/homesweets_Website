import { Component } from '@angular/core';
import { KitchenService } from '../kitchen.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services';
import { Subject, takeUntil } from 'rxjs';
import * as _ from "lodash";
import {ActivatedRoute} from '@angular/router';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-kitchen-list',
  templateUrl: './kitchen-list.component.html',
  styleUrls: ['./kitchen-list.component.scss'],
  providers: [KitchenService]

})
export class KitchenListComponent {
  kitchens! : any[];
  private unsubscribe = new Subject<void>();
currentRoute : any ="";
s3URL: any = environment.s3Url;
baseUrl:any= environment.baseUrl;
s3ApiUrl: any = environment.s3Api;
searchSelection : any = [];
  constructor(private kitchenService: KitchenService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService) {
      // this.messageService
      // .getMessage()
      // .pipe(takeUntil(this.unsubscribe))
      // .subscribe((data) => {
      //   console.log(data,">>>>")
      //   if(data && data.viewKitchens == true) {
      //     this.getFilterData(data.searchKey);
      //   }
      // });
  }

  ngOnInit() {
    console.log(this.router.url,">>>>kitchen router");
    this.currentRoute = this.router.url;
    let kitchenData = localStorage.getItem("kitchens");
    this.kitchens = kitchenData ?  JSON.parse(kitchenData): [];
    let selectedData = localStorage.getItem("searchSelection");
    console.log(selectedData,">>>selectedData")
    if(selectedData) {
      this.searchSelection = [];
      this.searchSelection.push(JSON.parse(selectedData));
    }
    // this.kitchenService.getKitchens({category: this.currentRoute}).then(result => {
    //   this.kitchens = (result && result.kitchens) ? result.kitchens : [];
    // });
  }

  getFilterData (searchVal:any) {
    console.log(searchVal,">>>searchVal")
    if(searchVal == '') {
      this.ngOnInit()
    }else{
      this.kitchens = _.filter(
        this.kitchens, function(el) {
          console.log(el,">>>ele")
           return  el.name.toLowerCase().includes(searchVal.toLowerCase());
        }
      );
    }

  }
  ngOnDestroy() {
    this.unsubscribe.next();
  }
  viewProducts(kitchen:any) {
    localStorage.setItem("selectedKitchen", JSON.stringify(kitchen.kitchen));
    this.router.navigate(['products']);
  }
}
