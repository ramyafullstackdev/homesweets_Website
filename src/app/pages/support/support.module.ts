import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { SupportRoutingModule } from './support-routing.module';
import { ContactUsComponent } from '../contact-us/contact-us.component';
import { FaqComponent } from '../faq/faq.component';
import { ReturnAndRefundComponent } from '../return-and-refund/return-and-refund.component';
import { SellWithUsComponent } from '../sell-with-us/sell-with-us.component';
import { SupportComponent } from './support.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SupportComponent,
    ContactUsComponent,
    FaqComponent,
    ReturnAndRefundComponent,
    SellWithUsComponent
  ],
  imports: [
    CommonModule,
    SupportRoutingModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],

})
export class SupportModule { }