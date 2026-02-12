import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';
import { CheckoutComponent } from '../checkout/checkout.component';
import { DetailedCartComponent } from '../detailed-cart/detailed-cart.component';
import { ProductsListComponent } from '../products-list/products-list.component';
import { OrderComponent } from '../order/order.component';
import { MyAccountComponent } from '../my-account/my-account.component';
// import { authGuard } from '../auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        // component:MainComponent
        loadChildren: () => import('../main/main.module').then(m => m.MainModule)
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        // canActivate: [authGuard]
      }, {
        path: 'cart',
        component: DetailedCartComponent,
        // canActivate: [authGuard]
      }, {
        path: 'products',
        component: ProductsListComponent
      }, {
        path: 'order',
        component: OrderComponent,
        // canActivate: [authGuard]
      }, {
        path: 'my_account',
        component: MyAccountComponent,
        // canActivate: [authGuard]
      },
      {
        path: ':category',
        loadChildren: () => import('../kitchen/kitchen.module').then(m => m.KitchenModule)
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class HomeRoutingModule { }