import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { MaterialModule } from 'src/app/material.module';
import { NavbarComponent } from './navbar/navbar.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
// import { MainComponent } from './main/main.component';
import { MainModule } from './main/main.module';
import { CartSummaryComponent } from './cart-summary/cart-summary.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { DetailedCartComponent } from './detailed-cart/detailed-cart.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { OrderComponent } from './order/order.component';
import { MyAccountComponent } from './my-account/my-account.component';

import {  GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { SocialLoginModule, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import {
  GoogleLoginProvider
} from '@abacritt/angularx-social-login';
import { LoginComponent } from './my-account/login/login.component';
import { RegisterComponent } from './my-account/register/register.component';
import { AccountComponent } from './my-account/account/account.component';
import { InformationComponent } from './my-account/information/information.component';
import { AddressComponent } from './my-account/address/address.component';
import { OrdersComponent } from './my-account/orders/orders.component';
import { VoucherComponent } from './my-account/voucher/voucher.component';
import { CardsComponent } from './my-account/cards/cards.component';
import { CreditsComponent } from './my-account/credits/credits.component';
import {NgFor, AsyncPipe} from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { NgxUiLoaderModule, NgxUiLoaderConfig, SPINNER, POSITION,PB_DIRECTION, NgxUiLoaderRouterModule, NgxUiLoaderHttpModule } from 'ngx-ui-loader';
import { ReviewComponent } from './review/review.component';
import { RatingModule } from 'primeng/rating';
import { ReviewDialogComponent } from './review-dialog/review-dialog.component';
import { FavoriteLoginComponent } from './favorite-login/favorite-login.component';
import { MyReviewComponent } from './my-account/my-review/my-review.component';
import { ScrollingBannerComponent } from './scrolling-banner/scrolling-banner.component';
import { MyWishlistComponent } from './my-account/wishlist/wishlist.component';
import { CartModalComponent } from './cart-modal/cart-modal.component';
import { KitchenModule } from './kitchen/kitchen.module';
import { AdminLoginComponent } from './admin-login/admin-login.component';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: 'rgba(12,80,219,0.98)',
  bgsOpacity: 1,
  bgsPosition: POSITION.centerCenter,   
  bgsSize: 40,
  bgsType: SPINNER.threeStrings,
  fgsColor: 'rgba(12,80,219,0.98)',
  fgsPosition: POSITION.centerCenter,   
  fgsSize: 60,
  fgsType: SPINNER.threeStrings
  };
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent,
    NavbarComponent,
    HeaderComponent,
    CartSummaryComponent,
    DetailedCartComponent,
    ProductsListComponent,
    OrderComponent,
    FooterComponent,
    MyAccountComponent,
    LoginComponent,
    RegisterComponent,
    AccountComponent,
    InformationComponent,
    AddressComponent,
    OrdersComponent,
    VoucherComponent,
    CardsComponent,
    CreditsComponent,
    ReviewComponent,
    ReviewDialogComponent,
    FavoriteLoginComponent,
    MyReviewComponent,
    ScrollingBannerComponent,
    MyWishlistComponent,
    CartModalComponent,
    AdminLoginComponent
    // MainComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialModule,
    MainModule,
    NgbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule,
    GoogleSigninButtonModule,
    NgFor,
    AsyncPipe,    
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderRouterModule,
    NgxUiLoaderHttpModule,
    ToastrModule.forRoot({ positionClass: 'toast-top-right' ,timeOut: 2000}),
    RatingModule,
    KitchenModule
  ],
  providers: [
    {
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false, //keeps the user signed in
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider('456042254248-g6ig8as3qisimuagl8i2ecbl14tchh68.apps.googleusercontent.com') // your client id
        }
      ],onError: (err) => {
        console.error(err);
      }
    } as SocialAuthServiceConfig
  } 
],
  bootstrap: [AppComponent]
})
export class AppModule { }
