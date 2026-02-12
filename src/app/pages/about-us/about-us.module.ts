import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { AboutUsRoutingModule } from './about-us-routing.module';
import { AboutUsComponent } from './about-us.component';
import { TermsOfServiceComponent } from '../terms-of-service/terms-of-service.component';
import { PoliciesComponent } from '../policies/policies.component';
import { PackageShipmentComponent } from '../package-shipment/package-shipment.component';
import { TermsAndConditionsComponent } from '../terms-and-conditions/terms-and-conditions.component';
import { OurStoryComponent } from 'src/app/our-story/our-story.component';
@NgModule({
  declarations: [
    AboutUsComponent,
    TermsOfServiceComponent,
    PoliciesComponent,
    TermsAndConditionsComponent,
    PackageShipmentComponent,
    OurStoryComponent
  ],
  imports: [
    CommonModule,
    AboutUsRoutingModule,
    MaterialModule,
    RouterModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],

})
export class AboutUsModule { }