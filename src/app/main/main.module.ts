import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';

import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    MainComponent
  ],
  imports: [
    MainRoutingModule,
    CommonModule,
    MaterialModule,
    ButtonModule,
    CarouselModule,
    ImageModule,
    FormsModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class MainModule { }