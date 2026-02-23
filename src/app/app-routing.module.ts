import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'support',
    loadChildren: () => import('./pages/support/support.module').then(m => m.SupportModule),
  },
  {
    path: 'about-us',
    loadChildren: () => import('./pages/about-us/about-us.module').then(m => m.AboutUsModule),
  },

  { path: "**" , component: PageNotFoundComponent},


];


@NgModule({
  imports: [RouterModule.forRoot(routes,{
    scrollPositionRestoration: "enabled",
    // scrollOffset: [0, 0],
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
