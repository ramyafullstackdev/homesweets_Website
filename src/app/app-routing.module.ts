import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { adminGuard } from './admin-login/admin.guard';

const routes: Routes = [
  {
    path: 'admin-login',
    component: AdminLoginComponent
  },
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    canActivate: [adminGuard]
  },
  {
    path: 'support',
    loadChildren: () => import('./pages/support/support.module').then(m => m.SupportModule),
    canActivate: [adminGuard]
  },
  {
    path: 'about-us',
    loadChildren: () => import('./pages/about-us/about-us.module').then(m => m.AboutUsModule),
    canActivate: [adminGuard]
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
