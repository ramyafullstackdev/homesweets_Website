import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { KitchenComponent } from '../kitchen/kitchen.component';
import { KitchenRoutingModule } from './kitchen-routing.module';
import { KitchenListComponent } from './kitchen-list/kitchen-list.component';
import { KitchenProductsComponent } from './kitchen-products/kitchen-products.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { FilterSidebarComponent } from './filter-sidebar/filter-sidebar.component';

// import { NgxUiLoaderModule } from "ngx-ui-loader";
@NgModule({
  declarations: [
    KitchenComponent,
    KitchenListComponent,
    KitchenProductsComponent,
    ProductListComponent,
    ProductCardComponent,
    FilterSidebarComponent
  ],
  imports: [
    CommonModule,
    KitchenRoutingModule,
    MaterialModule,
    FormsModule,ReactiveFormsModule
    // NgxUiLoaderModule
  ],
  exports:[FilterSidebarComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],

})
export class KitchenModule { }