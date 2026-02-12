import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { HomeRoutingModule } from './home-routing.module';
import { KitchenRoutingModule } from '../kitchen/kitchen-routing.module';
import { Footer } from 'primeng/api';

// import { NgxUiLoaderModule } from "ngx-ui-loader";
@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MaterialModule,
    KitchenRoutingModule
    // NgxUiLoaderModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],

})
export class HomeModule { }