import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutUsComponent } from './about-us.component';
import { TermsOfServiceComponent } from '../terms-of-service/terms-of-service.component';
import { PoliciesComponent } from '../policies/policies.component';
import { PackageShipmentComponent } from '../package-shipment/package-shipment.component';
import { TermsAndConditionsComponent } from '../terms-and-conditions/terms-and-conditions.component';
import { OurStoryComponent } from 'src/app/our-story/our-story.component';

const routes: Routes = [
  {
    path: '',
    component: AboutUsComponent,
    children: [
  
  { path: "terms-of-services" , component: TermsOfServiceComponent},
  { path: "policies/:name" , component: PoliciesComponent},
  { path: "package-shipment" , component: PackageShipmentComponent},
  { path: "terms-and-conditions" , component: TermsAndConditionsComponent},
  { path: "our-story" , component: OurStoryComponent},

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutUsRoutingModule { }