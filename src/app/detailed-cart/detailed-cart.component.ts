import { Component, ElementRef, ViewChild } from '@angular/core';
import { CartService } from '../cart-summary/cart.service';
import * as _ from "lodash";
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { MessageService } from '../services';
import { ProductService } from '../products-list/product.service';
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
  selector: 'app-detailed-cart',
  templateUrl: './detailed-cart.component.html',
  styleUrls: ['./detailed-cart.component.scss'],
  providers: [CartService, ProductService, MainService, OrderService ]

})
export class DetailedCartComponent {
  cartData: any;
  cartProduct:any;
  totalCartValue : any = 0;
  totalItems: any = 0;
  s3ApiUrl: any = environment.s3Api;
  loggedIn : Boolean = false;
  currentUser: any = {};
  showSaveAlert : Boolean = false;
  buylater: any = [];
  kitchenAlert: Boolean = false;
  selectedData: any ={};
  selectedProduct : any = {};
  productIds: any;
  @ViewChild('addInquiry', { static: false }) addInquiryBtn!: ElementRef<HTMLButtonElement>;
    inquiryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
      countryCode: new FormControl(null as CountryCode | null, Validators.required),
      message: new FormControl('', [Validators.required])
    });
    currentCart: any;
    filteredCountryCodes!: Observable<any[]>;
    countryCodes: any[] = [];
  constructor( private cartService:CartService, 
    private router: Router, private messageService: MessageService, private productService: ProductService,private mainService: MainService, private toastr : ToastrService, private orderService: OrderService) {}
  ngOnInit() {
    let cartDetails = localStorage.getItem("cartData");
    this.cartData = cartDetails ? JSON.parse(cartDetails) : [];
    let cartProduct = localStorage.getItem("cartProduct");
    this.cartProduct = cartProduct ? JSON.parse(cartProduct): [];
    this.loggedIn = localStorage.getItem("loggedIn") ? true : false;
    let tempVal = localStorage.getItem("currentUser");
    this.currentUser =tempVal ? JSON.parse(tempVal) : null;
    if(this.currentUser) {
      this.cartService.getBuyLater(this.currentUser._id).then(response => {
        this.buylater = response;
      });
    }

    // this.cartService.getCartSummary().then(cartData => {
    //   this.cartData = cartData;
      this.calculateMainTotal();
    // });

    this.productIds = [];

    this.cartData.forEach((item: any) => {
      this.productIds.push(item.productId);
    });
    this.getCountry()
    this.filteredCountryCodes = this.inquiryForm.controls['countryCode'].valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map(name => name ? this._filter(name) : this.countryCodes.slice())
    );
  }
  calculatedTotal(cart:any, action:any) {
    if(action == '-'){
      cart.quantity--;
    }

    if(action == '+'){
      if(cart.preOrder || !cart.stock){
        cart.quantity++;
      } else if(cart.stock && cart.quantity < cart.stock){
        cart.quantity++;
      }
    }
    if(cart.quantity < 1){
      cart.quantity = 1;
    }

    if (cart.quantity > 500 && cart.preOrder) {
      cart.quantity--;
      this.currentCart = cart;
      this.addInquiryBtn.nativeElement.click();
    } else {
    cart.totalVal = Math.round(cart.quantity * cart.productCurrentPrice);
    this.calculateMainTotal();
    return cart.totalVal;
    }
  }

  calculateValue(eventVal: any, product: any) {
    product.quantity = eventVal.target.value;
    this.calculatedTotal(product, null);
  }

  calculateMainTotal (){
    this.totalCartValue =0;
    this.totalItems = 0;
    _.forEach(this.cartData , (cart)=>{
      cart.totalVal = Math.round(cart.quantity * cart.productCurrentPrice);
      this.totalItems = this.totalItems + parseInt(cart.quantity);
      this.totalCartValue = this.totalCartValue + cart.totalVal;
    })
    localStorage.setItem("cartData", JSON.stringify(this.cartData));
    if(this.cartData && this.cartData.length == 0) {
      // this.router.navigate([""])
    }
  }

  saveforlater(cart:any) {
    if(this.loggedIn && this.currentUser) {
      this.showSaveAlert = false;
          this.cartService.saveLater(cart, this.currentUser._id).subscribe({
            next: (result) => {
              this.removeItem(cart);
              this.ngOnInit();
            },error: (e) => console.error(e),
            complete: () => console.info('complete')
          });
          this.messageService.sendMessage({refresh: true});

    }else{
      this.showSaveAlert = true;
    }  
  }        
  kitchenConfirm(confirm:any) {
    if(confirm == 'yes'){
      this.cartData = [];
      this.cartProduct = [];
      // this.cartQuantity = 0;
      localStorage.setItem("cartData", JSON.stringify(this.cartData));
      localStorage.setItem("cartProduct", JSON.stringify(this.cartProduct));
      this.kitchenAlert = false;
      this.movetocart(this.selectedData);
    }
  }
  movetocart(cart: any) {
      this.selectedData = cart.product ? cart.product : cart;
      this.selectedProduct= cart;
      let cartVal = cart.product ? cart.product : cart;
      if(this.cartProduct.includes(cartVal)) {
        let kitchenIndex = _.findIndex(this.cartData, {userId: cartVal.userId});
        let existIndex = _.findIndex(this.cartData, {productName:cartVal.productName,
          productImagePath:cartVal.productImagePath,
          productDescription:cartVal.productDescription,productCurrentPrice:cartVal.productCurrentPrice})
          this.cartData[existIndex].quantity =  this.cartData[existIndex].quantity+1;
          // setTimeout(()=>{
          //   this.removebuyItem(cart);
          // },1000)
          // this.cartQuantity =this.cartData[existIndex].quantity;
          // this.cartData.push(existProduct[0]);
  
      }else{
        let kitchenIndex = _.findIndex(this.cartData, {userId: cartVal.userId});
        if(kitchenIndex == -1 && this.cartData && this.cartData.length > 0) {
          this.kitchenAlert = true;
        }else{
          this.cartProduct.push(cartVal);
          this.cartData.push({
            productName:cartVal.productName,
            productImagePath:cartVal.productImagePath,
            productDescription:cartVal.productDescription,
            productCurrentPrice:cartVal.productCurrentPrice,
            discount: cartVal.productDiscount,
            quantity :1,
            userId: cartVal.userId
          });
          // setTimeout(()=>{
          //   this.removebuyItem(cart);
          // },1000)
          // this.removebuyItem(cart);
          // this.cartQuantity = 1;
        }
      }
      localStorage.setItem("cartData", JSON.stringify(this.cartData));
      localStorage.setItem("cartProduct", JSON.stringify(this.cartProduct));
      this.messageService.sendMessage({refresh:true});
  }

  removebuyItem(cart: any) {
    this.cartService.removeSaveLater(cart._id).then(response => {
      this.ngOnInit();
      // this.buylater = response;

    });
  }


  removeItem(cart:any) {
    let index = this.cartData.indexOf(cart);
    if (index === -1) return;
    this.cartData.splice(index, 1);
    // this.messageService.sendMessage({refresh:true});
    localStorage.setItem("cartData", JSON.stringify(this.cartData));
    this.calculateMainTotal();
  }

  checkPrduct(){
    let corrctQantity:any = [];
    this.productService.getselectedProdcts({products: this.productIds}).then(response => {
      let products = response.products || [];
      products.forEach((element: any) => {
        let productIndex = this.cartData.findIndex((x: any)=> x.productId == element._id)
        let product: any;

        if(productIndex > -1){
          product = this.cartData[productIndex]
        }
        if(element.prices && element.prices.length) {
            let index =  element.prices.findIndex((x: any)=> x.weight == product.productWeight)
            if(index > -1){
              if(element.prices[index].onStock && element.prices[index].stock >= product.quantity){
                corrctQantity.push(true)
              } else if(element.prices[index].onStock) {
                corrctQantity.push(false)
              } else {
                this.router.navigate(["/order"])
              }
            }
        }
      });
      if(corrctQantity.includes(false)){
        this.toastr.error('Stock Error', 'Some items exceed available stock. Please adjust quantity.');
      } else {
        this.router.navigate(["/order"])
      }
    });
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
    }).catch(() => { });
  }

  displayCode(code: any): string {
    return code ? `${code.name} (${code.dial_code})` : '';
  }

  continueShopping() {
		let obj = {
			refresh: true
		}
		this.messageService.sendMessage(obj);
    this.router.navigate(["/"])
  }
}
