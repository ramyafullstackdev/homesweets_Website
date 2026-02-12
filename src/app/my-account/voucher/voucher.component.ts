import { Component } from '@angular/core';
import { OrderService } from 'src/app/order/order.service';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.scss'],
  providers: [OrderService]

})
export class VoucherComponent {
  vouchers: any = [];
  viewDetails: Boolean = false;
  selectedOrder :any = {};

  constructor(
    private orderService: OrderService
  ){}

  ngOnInit(){
    this.orderService.getVouchers().then(voucher => {
      this.vouchers = voucher;
    });
  }
}
