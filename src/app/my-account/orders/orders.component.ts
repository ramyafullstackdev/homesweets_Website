import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { OrderService } from 'src/app/order/order.service';
import { ReviewComponent } from 'src/app/review/review.component';
import { ReviewService } from 'src/app/review/review.service';
import { MessageService } from 'src/app/services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  providers: [OrderService]

})
export class OrdersComponent {
  orders: any = [];
  viewDetails: Boolean = false;
  selectedOrder :any = {};
  s3ApiUrl: any = environment.s3Api;
  productReview: any = [];
  baseURL: any = environment.apiUrl
  constructor(
    private orderService: OrderService,
    private messageService : MessageService,
    public dialog: MatDialog,
    private http: HttpClient
  ){
    // this.messageService
		// .getMessage()
		// // .pipe(takeUntil(this.unsubscribe))
		// .subscribe((data) => {
		//   console.log(data,">>>>")
    //   if(data && data.fromOrderView ){
    //     // this.showView = data.key
    //   }
		// });
  }

  ngOnInit(){
    localStorage.removeItem("orderDetail");
    const userData = localStorage.getItem("currentUser");
    const userId = userData ? JSON.parse(userData)._id : "";
    let obj = {
      sideKey:"Orders"
    }
    this.messageService.sendMessage(obj);
    this.orderService.getOrders(userId).then(orders => {
      this.orders = orders;
      console.log(this.orders,">>>>>orders")
    });
  }

  viewOrder(order:any) {
    this.viewDetails = true;
    localStorage.setItem("orderDetail", JSON.stringify(order));
    let obj = {
      sideKey:"Orders"
    }
    this.messageService.sendMessage(obj);
    this.selectedOrder = order;
  }

  openPopup(currentData: any) {
    const userData = localStorage.getItem("currentUser");
    const userId = userData ? JSON.parse(userData)._id : "";
  
    const dataObj = {
      productId: currentData.productId,
      userId: userId
    };
  
    console.log(currentData);
  
    this.http.post<any>(`${this.baseURL}/review/get`, dataObj).subscribe({
      next: (result) => {
        console.log(result, ">> RESULT");
        if (result.meta.status === 200) {
          this.productReview = result.response;
  
          const _popup = this.dialog.open(ReviewComponent, {
            width: '40%',
            height: 'fit-content',
            data: {
              title: "Product Review",
              data: {...dataObj, data:this.productReview},
              isLoggedIn: localStorage.getItem('loggedIn')
            }
          });
  
          _popup.afterClosed().subscribe(() => {
            this.ngOnInit();
          });
        }
      },
      error: (e) => console.error(e)
    });
  }
  

}
