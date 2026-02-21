import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { CartService } from './cart.service';
import * as _ from "lodash";
import { environment } from 'src/environments/environment';
import { MessageService } from '../services';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MainService } from '../main/main.service';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, startWith } from 'rxjs';
import { OrderService } from '../order/order.service';

interface CountryCode {
    name: string;
    flag: string;
    code: string;
    dial_code: string;
    phone_min_length: number;
    phone_max_length: number;
}
@Component({
  selector: 'app-cart-summary',
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.scss'],
  providers: [CartService, MainService, OrderService]

})
export class CartSummaryComponent {
  cartData: any;
  totalCartValue : any = 0;
  baseUrl : any = environment.baseUrl;
  s3URL: any = environment.s3Url;
  s3ApiUrl: any = environment.s3Api;
  totalCount:any;
  totalFavCont: any;
  favIds: any;
  favoriteOffers: any;
  favoriteProduct: any;
  favoriteKitchen: any;
  isCart: boolean = false; // default
  @ViewChild('addInquiry', { static: false }) addInquiryBtn!: ElementRef<HTMLButtonElement>;
  inquiryForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
    countryCode: new FormControl(null as CountryCode | null, Validators.required),
    message: new FormControl('', [Validators.required])
  });
  currentCart: any;
  currentUser: any;
  filteredCountryCodes!: Observable<any[]>;
  recommendedProducts:any[] = []
  @ViewChild('recommendationsScroll') recommendationsScroll!: ElementRef;
  canScrollLeft = false;
  canScrollRight = true;
    countryCodes: any[] = [];
  constructor(public activeOffcanvas: NgbActiveOffcanvas, 
    private cartService:CartService,
    private messageService: MessageService,
    private router: Router,
    private cd:  ChangeDetectorRef,
    private mainService: MainService, private toastr : ToastrService,
    private orderService: OrderService) {}
  ngOnInit() {
    this.recommendedProducts = [
      { productName: 'Paneer Butter Masala', productImagePath: 'assets/images/4.jpg', productWeight: '250g', productCurrentPrice: 250 },
      { productName: 'Veg Biryani', productImagePath: 'assets/images/5.jpg', productWeight: '500g', productCurrentPrice: 180 },
      { productName: 'Chicken Curry', productImagePath: 'assets/images/6.jpg', productWeight: '400g', productCurrentPrice: 220 },
      { productName: 'Chapati Set', productImagePath: 'assets/images/7.jpg', productWeight: '2 pcs', productCurrentPrice: 60 },
    ];
    this.currentUser = JSON.parse(localStorage.getItem("currentUser") || "[]")
    if(this.isCart){
      let cartDetails = localStorage.getItem("cartData");
      this.cartData = cartDetails ? JSON.parse(cartDetails) : [];
      // this.cartService.getCartSummary().then(cartData => {
      //   this.cartData = cartData;
        this.calculateMainTotal();
      // });
    } else {
      let favIds = localStorage.getItem("favoritsIds");
      this.favIds = favIds? JSON.parse(favIds) : [];
      let favDetails = localStorage.getItem("favoriteOffers");
      this.favoriteOffers = favDetails ? JSON.parse(favDetails) : []
      let favoriteProduct = localStorage.getItem("favoriteProduct");
      this.favoriteProduct = favoriteProduct ? JSON.parse(favoriteProduct) : []
      let favoriteKitchen = localStorage.getItem("favoriteKitchen");
      this.favoriteKitchen = favoriteKitchen ? JSON.parse(favoriteKitchen) : []
      this.totalFavCont = this.favIds.length;

    }
    this.getCountry()
    this.filteredCountryCodes = this.inquiryForm.controls['countryCode'].valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map(name => name ? this._filter(name) : this.countryCodes.slice())
    );
  }

  calculateMainTotal (){
    this.messageService.sendMessage({refresh:true});
    this.totalCartValue = 0;
    this.totalCount = 0;
    _.forEach(this.cartData , (cart)=>{
      cart.totalVal = Math.round(cart.quantity * cart.productCurrentPrice);
      this.totalCount = this.totalCount + parseInt(cart.quantity);
      this.totalCartValue = this.totalCartValue + cart.totalVal;
    })
  }

  // calculatedTotal(cart:any, action:any) {
  //   console.log(cart,">>",action)
  //   if(action == '-'){
  //     cart.quantity--;
  //   }
  //   if(action == '+'){
  //     cart.quantity++;
  //   }
  //   if(cart.quantity < 1){
  //     cart.quantity = 1;
  //   }
  //   if (cart.quantity > 500 && cart.preOrder) {
  //     cart.quantity--;
  //     this.currentCart = cart;
  //     this.addInquiryBtn.nativeElement.click();
  //   } else {
  //     cart.totalVal = Math.round(cart.quantity * cart.productCurrentPrice);
  //     let index = this.cartData.findIndex((item: any) => item.productId == cart.productId);
  //     if(index > -1){
  //       this.cartData[index].totalVal = cart.totalVal;
  //     }
  //     this.calculateMainTotal();

  //     localStorage.setItem("cartData", JSON.stringify(this.cartData));
  //     this.messageService.sendMessage({key:"headerCart"});
  //     this.cd.detectChanges()
  //     return cart.totalVal;
  //   }
      
  // }
  calculatedTotal(cart: any, action: '+' | '-' | null) {
  this.cartService.updateCartQuantity(cart, action, this.currentUser);

  this.cartService.cartUpdated$.subscribe(msg => {
    if (msg.inquiry) {
      this.currentCart = msg.inquiry;
      this.addInquiryBtn.nativeElement.click();
    }
    if (msg.refresh) {
      this.cd.detectChanges();
      this.cartData = JSON.parse(localStorage.getItem("cartData") || "[]");
      this.calculateMainTotal();
      this.messageService.sendMessage({ key: 'headerCart' });
    }
  });
}
  redirect(){
    this.router.navigate(["cart"]);
  }
  calculateValue(eventVal:any, cart:any) {
    console.log(eventVal.target.value,">>>>>", cart)
    // cart.quantity = eventVal.target.value;
    cart.quantity = parseInt(eventVal.target.value, 10);
    this.calculatedTotal(cart, null);
  }

  currentStock(data:any){
   return data.onStock && data.stock >= 0 ? data.stock  : data.onStock && !data.stock ? data.stock : !data.onStock ? 1000 : 0
  }

  removeItem(cart:any) {
    // let index = this.cartData.indexOf(cart);
    // console.log(cart,">>>",index)
    // this.cartData.splice(index, 1);
    this.cartService.removeItem(cart, this.currentUser).then((updatedCartData: any) => {
  this.cartData = updatedCartData;
  this.calculateMainTotal();
  this.cd.detectChanges();
  this.messageService.sendMessage({ key: 'headerCart' });
});

  }
  

  getFullStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
  
  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }
  
  getEmptyStars(rating: number): number[] {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return Array(5 - full - half).fill(0);
  }

  removeItemFav(fav:any, type: any) {
    if(type == 'offer'){
      let index = this.favoriteOffers.indexOf(fav);
      this.favoriteOffers.splice(index, 1);
      localStorage.setItem("favoriteOffers", JSON.stringify(this.favoriteOffers));
    }

    if(type == 'product'){
      let index = this.favoriteProduct.indexOf(fav);
      this.favoriteProduct.splice(index, 1);
      localStorage.setItem("favoriteProduct", JSON.stringify(this.favoriteProduct));
    }

    if(type == 'kitchen'){
      let index = this.favoriteKitchen.indexOf(fav);
      this.favoriteKitchen.splice(index, 1);
      localStorage.setItem("favoriteKitchen", JSON.stringify(this.favoriteKitchen));
    }
    let index = this.favIds.indexOf(fav._id);
    this.favIds.splice(index, 1);
    localStorage.setItem("favoritsIds", JSON.stringify(this.favIds));
    this.messageService.sendMessageCategory({isFav: true});
  }

  redirectUrl(fav:any, type: any){
   if(type == "product"){
   localStorage.setItem("selectedProduct", JSON.stringify(fav));
   localStorage.setItem("routeFrom", "offers");
   this.router.navigate(['products']);
   } else {
    localStorage.setItem("selectedKitchen", JSON.stringify(fav));
    this.router.navigate(['products']);
   }
  }

    submitInquiry() {
    if (this.inquiryForm.valid) {
      let query = {
        name: this.inquiryForm.value.name,
        email: this.inquiryForm.value.email,
        phoneNumber: this.inquiryForm.value.phoneNumber,
        countryCode: this.inquiryForm.value.countryCode,
        message: this.inquiryForm.value.message,
        productId: this.currentCart.productId,
        productName: this.currentCart.productName,
        userId: this.currentUser ? this.currentUser._id : null
      }
       this.mainService.createInquiry(query).then(result => {
        console.log(result,">>>>result")
        if(result.ERROR){
          this.toastr.error('Error!', result.ERROR);
        } else {
          this.toastr.success('Sucess!', ' created sucessflly');
        }

        this.inquiryForm.reset();
        this.closeModal();
       })
    } else {
      this.inquiryForm.markAllAsTouched(); // show validation messages
    }
  }

  @ViewChild('closeBtn', { static: false }) closeBtn!: ElementRef<HTMLButtonElement>;

  closeModal() {
    this.closeBtn.nativeElement.click();
  }

          private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.countryCodes.filter(option =>
      option.name.toLowerCase().includes(filterValue) ||
      option.dial_code.includes(filterValue)
    );
  }

    getCountry() {
    this.orderService.getCountryCode().then(countryCodes => {
      this.countryCodes = countryCodes.response || [];
      const defaultCountry = this.countryCodes.find(c => c.dial_code === '+91');
      if (defaultCountry) {
        this.inquiryForm.patchValue({ countryCode: defaultCountry });
      }
    }).catch(() => {});
  }
  
  displayCode(code: any): string {
    return code ? `${code.name} (${code.dial_code})` : '';
  }

  decreaseQuantity(cart: any) {
    if (cart.quantity > 1) {
      cart.quantity--;
      this.calculateValue({ target: { value: cart.quantity } }, cart);
    }
  }

  increaseQuantity(cart: any) {
    const maxStock = cart.preOrder ? Infinity : this.currentStock(cart);
    if (cart.quantity < maxStock) {
      cart.quantity++;
      this.calculateValue({ target: { value: cart.quantity } }, cart);
    }
  }


  scrollRecommendations(direction: 'left' | 'right') {
    const container = this.recommendationsScroll.nativeElement;
    const scrollAmount = 220; 

    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }

    setTimeout(() => this.updateScrollButtons(), 300);
  }

  onRecommendationsScroll() {
    this.updateScrollButtons();
  }

  updateScrollButtons() {
    const container = this.recommendationsScroll?.nativeElement;
    if (!container) return;

    this.canScrollLeft = container.scrollLeft > 0;
    this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10);
  }

  addRecommendedToCart(product: any) {
    // console.log('paru', product);
  }
}
