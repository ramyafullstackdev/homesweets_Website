import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupportComponent } from './support.component';
import { ContactUsComponent } from '../contact-us/contact-us.component';
import { FaqComponent } from '../faq/faq.component';
import { ReturnAndRefundComponent } from '../return-and-refund/return-and-refund.component';
import { SellWithUsComponent } from '../sell-with-us/sell-with-us.component';

const routes: Routes = [
  {
    path: '',
    component: SupportComponent,
    children: [
      { path: "contact-us", component: ContactUsComponent },
      { path: "faq", component: FaqComponent },
      { path: "return-and-refund", component: ReturnAndRefundComponent },
      { path: "sell-with-us", component: SellWithUsComponent },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupportRoutingModule { }