import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ProductService } from './product.service';
import * as _ from "lodash";
import { MessageService } from '../services';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ReviewComponent } from '../review/review.component';
import { ReviewService } from '../review/review.service';
import { Router } from '@angular/router';
import { FavoriteLoginComponent } from '../favorite-login/favorite-login.component';
import { MainService } from '../main/main.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, startWith } from 'rxjs';
import { OrderService } from '../order/order.service';
import { CartService } from '../cart-summary/cart.service';

interface CountryCode {
    name: string;
    flag: string;
    code: string;
    dial_code: string;
    phone_min_length: number;
    phone_max_length: number;
}
@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  providers: [ProductService, ReviewService, MainService]

})
export class ProductsListComponent {
  products: any[] = [];
  otherProducts: any[] = [];
  kitchen: any = {};
  s3URL: any = environment.s3Url;
  s3ApiUrl: any = environment.s3Api;

  cartData!: any[];
  cartProduct!: any[];
  cartQuantity: any;

  selectedData: any = {};
  kitchenAlert: Boolean = false;
  baseUrl: any = environment.baseUrl;
  kitchenDetail: any = {};
  categoryName: any = "";
  selectedProduct: any = {};
  routeFrom: any = "";
  showDetail : Boolean = false;
  searchSelection : any = {};
  kitchenReview: any = [];
  productReview: any = [];
  currentWeightSelect: any;
  quantityOptions: any = Array.from({ length: 31 }, (_, i) =>{
    if(i == 30){
      return {number: 31, display: "30+"};
    } else {
      return i + 1;
    }
  });
  favoriteIds: any[] = [];
  favorite: any[] = [];
  favoriteProduct: any[] = [];
  favoriteKitchen: any[] = [];
  currentUser: any;
  isReset: boolean = true;
  @ViewChild('addInquiry', { static: false }) addInquiryBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('addcartModel', { static: false }) addcartModel!: ElementRef<HTMLButtonElement>;

  searchText: string = '';
  inquiryForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
    countryCode: new FormControl(null as CountryCode | null, Validators.required),
    message: new FormControl('', [Validators.required])
  });
  filteredCountryCodes!: Observable<any[]>;
  countryCodes: any[] = [];
  commonInstructions: any[] = [
    {
      icon: "assets/images/Free shipping.png",
      desp: "Free shipping on orders above ₹500"
    },
    {
      icon: "assets/images/Secure.png",
      desp: "Secure Payments"
    },
    {
      icon: "assets/images/Farmers Empowerment.png",
      desp: "Farmers Empowerment"
    },
    {
      icon: "assets/images/COD.png",
      desp: "COD available"
    },
  ];
  selectedImageIndex = 0;
  limit: number = 10;
  productReviewCount: number = 0;
  sortOptions = [
    { value: 'mostRecent', label: 'Most Recent' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' }
  ];
  selectedSort = 'mostRecent';

  averageRating = 4.81;
  totalReviews = 1175;
  ratingBreakdown = [
    { stars: 5, count: 0 },
    { stars: 4, count: 0 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 }
  ];
  maxReviews: any; // for bar scaling
  categoryIds:any[] = [];
  availabilityFilter: any = {};
  priceRamge: any = { min: 0, max: 5000 };
  mainPageFilter: any;
  faqList: any[] =[];
  constructor(private productService: ProductService, public dialog: MatDialog,private cdr: ChangeDetectorRef,
    private messageService: MessageService, private router: Router, private reviewServices: ReviewService,
    private mainService: MainService, private toastr: ToastrService, private orderService: OrderService,
    private cartService: CartService) {
    this.messageService
      .getMessage()
      .subscribe((data) => {
        if (data && data.category && !data.product) {
          this.categoryName = "";
          this.categoryIds = data.categoryIds;
          this.getKitchenWiseData();
        }
        if (data && data.availability && !data.product) {
          this.availabilityFilter = data.availabilityFilters;
          this.getKitchenWiseData();
        }

        if (data && data.price && !data.product) {
          this.priceRamge = data.priceRange;
          this.getKitchenWiseData();
        }
      });
  }

  ngOnInit() {
    this.categoryName = localStorage.getItem("currentCategory");
    let cartDetail = localStorage.getItem("cartData");
    let cartProduct = localStorage.getItem("cartProduct");
    let kitchenData = localStorage.getItem("selectedKitchen");
    let selectedVal = localStorage.getItem("selectedProduct");
    this.routeFrom = localStorage.getItem("routeFrom");
    let searchVal = localStorage.getItem("searchSelection");
    this.searchSelection = searchVal ? JSON.parse(searchVal) : {};
    this.currentUser = JSON.parse(localStorage.getItem("currentUser") || "[]")
    this.getfavorite()

    this.selectedProduct = selectedVal ? JSON.parse(selectedVal) : {};
    if (this.selectedProduct && this.selectedProduct.productName) {
      this.showDetail = true;
    }

    this.selectedProduct.productImagePath = [ this.selectedProduct.productImagePath, ...this.selectedProduct.additionalImages ];
    this.selectedProduct.features = [
      {
        icon: "assets/images/native_heirloom.png",
      },
      {
        icon: "assets/images/low_glycemic.png",
      },
      {
        icon: "assets/images/easy_on_gut.png",
      },
      {
        icon: "assets/images/stone_grond.png",
      }
    ];
    this.cartData = cartDetail ? JSON.parse(cartDetail) : [];
    this.cartProduct = cartProduct ? JSON.parse(cartProduct) : [];
    this.kitchenDetail = kitchenData ? JSON.parse(kitchenData) : {};
    this.kitchen = this.kitchenDetail;
    this.otherProducts = [];
    this.getProductReview();
    this.getKicthenReview();
    this.getFaqProduct();
    this.selectedProduct.quantity = 1;
    if(this.searchSelection && this.searchSelection.productName){
      this.productService.getProducts({kitchenId:this.kitchenDetail._id, searchVal : this.searchSelection.productName}).then(result => {
        this.products = (result && result.products) ? result.products : [];
        // if()
      });
      this.productService.getProducts({
        kitchenId: this.kitchenDetail._id,
        loadOthers: true,
        searchVal: this.searchSelection.productName
      }).then(result => {
        this.otherProducts = (result && result.products) ? result.products : [];
      });
    } else if (this.kitchenDetail && this.kitchenDetail._id) {
      this.getKitchenWiseData()
    }
    this.selectedPrice(0);
    this.getCountry()
    this.filteredCountryCodes = this.inquiryForm.controls['countryCode'].valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map(name => name ? this._filter(name) : this.countryCodes.slice())
    );
    this.favoriteIds = JSON.parse(localStorage.getItem("favoritsIds") || '[]');
    this.favorite = JSON.parse(localStorage.getItem("favoriteData") || '[]');
  }
  getKitchenWiseData() {
    this.productService.getProducts({ kitchenId: this.kitchenDetail._id, categoryIds: this.categoryIds, availability: this.availabilityFilter, priceRange: this.priceRamge, sortOption: this.sortOption }).then(result => {
      this.products = (result && result.products) ? result.products : [];
      for (let product of this.products) {
        if (product.prices && product.prices.length) {
          product.selectedWeight = product.prices[0].weight;
        }
      }
    });
  }
  // Method to set the main image
  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

getPricePerGram(price: number, weight: string): number {
  // Remove non-digit/non-decimal characters (so '5g' -> '5')
  const grams = parseFloat(weight.replace(/[^\d.]/g, ''));
  if (!grams) { return 0; } // Guard against divide by zero or bad input
  return price / grams;
}
  
  getfavorite(){
    if(this.currentUser?._id){
    this.mainService.getfav(this.currentUser?._id).then(result => {
      this.favoriteIds = result.favoriteId;
      this.favorite = result.offers;
      this.favoriteProduct = result.products;
      this.favoriteKitchen = result.kitchens
      localStorage.setItem("favoritsIds", JSON.stringify(this.favoriteIds));
      localStorage.setItem("favoriteOffers", JSON.stringify(this.favorite));
      localStorage.setItem("favoriteProduct", JSON.stringify(this.favoriteProduct))
      localStorage.setItem("favoriteKitchen", JSON.stringify(this.favoriteKitchen))

    });
  }
  }
  addFav(product: any) {

  }

  loadmore(limit:number){
    this.limit +=10;
    if(this.limit > this.productReviewCount){
      this.limit = this.productReviewCount;
    }
    this.getProductReview(this.limit);
  }

  sortReviews() {
    this.getProductReview(this.limit);
  }
  getProductReview(limit: number = this.limit) {
    let userData = localStorage.getItem("currentUser");
    let query = {
      productId: this.selectedProduct._id,
      userId: userData ? JSON.parse(userData)._id : "",
      limit: limit,
      selectedSort: this.selectedSort
    }
    this.reviewServices.getReview(query).subscribe({
      next: (result) => {
        if (result.meta.status === 200) {
          this.productReview = result.response?.response || [];
          this.productReviewCount = result.response?.count || 0;
          this.ratingBreakdown = this.getRatingBreakdown(this.productReview);
          this.maxReviews = this.ratingBreakdown[0].count;
        }
      },
      error: (e) => console.error(e),
      complete: () => console.info('complete')
    });
  }
  getFaqProduct() {
    let query = {
      productId: this.selectedProduct._id,
      kitchenId: this.kitchenDetail._id,
    }
    this.productService.getFaq(query).then(result => {
      let res = result
        this.faqList = (res && res.faq) ? result.faq : [];
      }).catch(e => {
        console.error(e)
      })
  }

  getKicthenReview(){
    let userData = localStorage.getItem("currentUser");

    let query = {
      kitchenId: this.kitchenDetail._id,
      userId: userData ? JSON.parse(userData)._id : "",
    }
    this.reviewServices.getReview(query).subscribe({
      next: (result) => {
        if(result.meta.status === 200) {
          this.kitchenReview  = result.response;
        }
      },
      error: (e) => console.error(e),
      complete: () => console.info('complete')
    });
  }

  openPopup(title: any, data?: any) {
    let userData = localStorage.getItem("currentUser");
    let dataObj = {}
    if(title === 'Product Review'){
      dataObj = {
        productId: this.selectedProduct._id,
        userId: userData ? JSON.parse(userData)._id : "",
        data: this.productReview,
        offers: this.selectedProduct.offerName ? true : false
      }
    } else {
      dataObj = {
        kitchenId: this.kitchenDetail._id,
        userId: userData ? JSON.parse(userData)._id : "",
        data: this.kitchenReview
      }
    }

    // if(localStorage.getItem('loggedIn')){
      var _popup = this.dialog.open(ReviewComponent, {
        width: '40%',
        height: 'fit-content',
        data: {
          title: title,
          data: dataObj,
          isLoggedIn:localStorage.getItem('loggedIn')
        }
      });
      _popup.afterClosed().subscribe(item => {
        this.ngOnInit();
          })
    // } else {
      // this.router.navigate(["my_account"]);
    // }

  }

  // async addCart(productParam: any, kitchen: any) {
  //   let product = JSON.parse(JSON.stringify(productParam));
    
    
  //   const selectedPrice = product.prices.find((price: any) => {
  //     return price.selected === true;
  //   });

  //   if(product.preOrder){
  //     product.productCurrentPrice = selectedPrice.currentPrice;
  //     product.productWeight = selectedPrice.weight;
  //   } else {
  //     product.productCurrentPrice = selectedPrice.productPrice ? await this.currentPriceCalculation(selectedPrice.productPrice, product.productDiscount) : selectedPrice.currentPrice;
  //     product.productWeight = selectedPrice.weight;
  //   }

  //   product.stock = selectedPrice.stock;
  //   product.onStock = selectedPrice.onStock;

  //   console.log(this.cartProduct, ">>>this.cartProduct")
  //   console.log(product, ">>>product")
    
  //   console.log(this.cartProduct.includes(product), ">>>this.cartProduct.includes(product)");
    
  //   this.selectedData = product;


  //   const indexExists = this.cartData.findIndex((cart) => {
  //     return (cart.productId === product._id) && (cart.productWeight === product.productWeight);
  //   });
  //   let textCon = ''
  //   if (indexExists !== -1) {
  //     textCon = "This product is already in your cart.";
  //   } else {
  //     textCon = "Product Successfully added to cart";
  //   }
  //   const headerSpan = this.addcartModel.nativeElement.getElementsByClassName("header-span")[0];
  //   if (headerSpan) {
  //     headerSpan.textContent = textCon;
  //   }
  //   if (indexExists !== -1) {
  //     this.cartData[indexExists].quantity = (this.cartData[indexExists].quantity || 0) + (product.quantity || 1);
  //     this.cartData[indexExists].productWeight = product.productWeight;
  //     this.cartData[indexExists].productCurrentPrice = product.productCurrentPrice;

  //     this.cartQuantity = this.cartData[indexExists].quantity;
  //   } else {
  //     this.cartProduct.push(product);
  //     this.cartData.push({
  //       productId: product._id,
  //       kitchen:product.kitchen,
  //       productName: product.productName,
  //       productImagePath: product.productImagePath,
  //       productDescription: product.productDescription,
  //       productCurrentPrice: product.productCurrentPrice,
  //       discount: product.productDiscount,
  //       quantity: product.quantity ? product.quantity : 1,
  //       userId: product.userId,
  //       productWeight: product.productWeight,
  //       stock: product.stock,
  //       onStock: product.onStock,
  //       preOrder: product.preOrder
  //     });

  //     this.cartQuantity = product.quantity ? product.quantity : 1;
  //   }

  //   // if (this.cartProduct.includes(product)) {
  //   //   // let kitchenIndex = _.findIndex(this.cartData, { userId: product.userId });
  //   //   let existIndex = _.findIndex(this.cartData, {
  //   //     productId: product._id
  //   //   });


  //   //   this.cartData[existIndex].quantity = this.cartData[existIndex].quantity + 1;
  //   //   this.cartData[existIndex].productWeight = product.productWeight;
  //   //   this.cartData[existIndex].productCurrentPrice = this.cartData[existIndex].quantity * product.productCurrentPrice;

  //   //   this.cartQuantity = this.cartData[existIndex].quantity;
  //   //   // this.cartData.push(existProduct[0]);

  //   // } else {
  //   //   let kitchenIndex = _.findIndex(this.cartData, { userId: product.userId });
  //   //   if (kitchenIndex == -1 && this.cartData && this.cartData.length > 0) {
  //   //     this.kitchenAlert = true;
  //   //   } else {
  //   //     this.cartProduct.push(product);
  //   //     this.cartData.push({
  //   //       productId: product._id,
  //   //       productName: product.productName,
  //   //       productImagePath: product.productImagePath,
  //   //       productDescription: product.productDescription,
  //   //       productCurrentPrice: product.productCurrentPrice,
  //   //       discount: product.productDiscount,
  //   //       quantity: product.quantity ? product.quantity : 1,
  //   //       userId: product.userId
  //   //     });

  //   //     this.cartQuantity = product.quantity ? product.quantity : 1;
  //   //   }
  //   // }


  //   localStorage.setItem("cartData", JSON.stringify(this.cartData));
  //   localStorage.setItem("cartProduct", JSON.stringify(this.cartProduct));
  //   this.messageService.sendMessage({ refresh: true });

  // }

  addCart(product: any, kitchen: string, kitchenData?: any) {
  this.cartService.addToCart(product, kitchen, kitchenData, this.currentUser)
    .then((data) => {
    this.selectedData = data;
    this.cartData = JSON.parse(localStorage.getItem("cartData") || "[]");
    this.cartProduct = JSON.parse(localStorage.getItem("cartProduct") || "[]");
    this.cartQuantity = this.cartData.reduce((total, item) => total + item.quantity, 0);
    this.messageService.sendMessage({ refresh: true });
    })
    .catch(() => {

    });
}

  currentPriceCalculation(originalPrice: number, discountPercentage: number) {
    // Calculate the discounted price
    const discountAmount = (originalPrice * discountPercentage) / 100;
    return (originalPrice - discountAmount);
  }

  getSelectedPrice() {

  }

  calculatedTotal(cart: any, action: any) {
    cart.quantity = cart.quantity ? cart.quantity : 1;
    if (action == '-') {
      cart.quantity--;
    }
    if(cart.stock && cart.quantity < cart.stock && action == '+'){
      cart.quantity++;
    } else if(!cart.stock && action == '+' ){
      cart.quantity++;
    }
    if(cart.quantity < 1){
      cart.quantity = 1;
    }

     if(cart.preOrder && action == '+'){
      cart.quantity++; 
    }
    
    if(cart.quantity > 500 && cart.preOrder){
      cart.quantity = 1;
      this.addInquiryBtn.nativeElement.click();
    } else {
    cart.totalVal = Math.round(cart.quantity * cart.productCurrentPrice);
    // this.calculateMainTotal();
    return cart.totalVal;
    }
  }

  calculateValue(eventVal:any, product:any) {
    if(eventVal.target.value < 31){
      product.quantity = 30
    } else {
      product.quantity = eventVal.target.value;
    }
    this.calculatedTotal(product, null);
  }

  calculatedTotal1(cart: any) {
    cart.quantity = +cart.quantity || 1;
    cart.totalVal = Math.round(cart.quantity * cart.productCurrentPrice);
    // this.calculateMainTotal(); // If needed
    return cart.totalVal;
  }
  
  // calculateMainTotal (){
  //   this.totalCartValue =0;
  //   this.totalItems = 0;
  //   _.forEach(this.cartData , (cart)=>{
  //     cart.totalVal = cart.quantity * cart.productCurrentPrice;
  //     this.totalItems = this.totalItems + parseInt(cart.quantity);
  //     this.totalCartValue = this.totalCartValue + cart.totalVal;
  //   })
  //   localStorage.setItem("cartData", JSON.stringify(this.cartData));
  //   if(this.cartData && this.cartData.length == 0) {
  //     // this.router.navigate([""])
  //   }
  // }
  async viewDetail(product: any) {

    await product.prices.map((price: any) => { price['selected'] = false });

    if (product.prices.length > 1) {
      product.prices[product.prices.length % 2].selected = true;
    }


    localStorage.setItem("selectedProduct", JSON.stringify(product));
    this.selectedProduct = product;
    this.selectedProduct.quantity = 1;
    this.showDetail = true;

    this.getProductReview()
  }
  enableCart: boolean = false;
  selectedPrice(indexParam: number) {
    this.currentWeightSelect = this.selectedProduct.prices[indexParam];
    this.selectedProduct.quantity = 1;
    this.selectedProduct.prices.map((price: any, index: number) => {
      if (indexParam === index) {
        price['selected'] = true;
        this.enableCart = false;
        this.quantityOptions = Array.from({ length: this.selectedProduct.preOrder ? 31 : (price.stock || 31) }, (_, i) => {
          if (i == 30) {
            return {number: 31, display: "30+"};
          } else {
            return i + 1;
          }
        });
        if(this.selectedProduct.preOrder) {
            this.enableCart = false;
        } else if(!price.stock){
            this.enableCart = true;
        } else {
          if (price.onStock && price.stock > 0) {
            this.enableCart = false;
          } else if (price.onStock && price.stock <= 0) {
            this.enableCart = true;
          }
        }
       
      } else {
        price['selected'] = false;
      }
    })
  }

  goBack() {
    this.showDetail = false;
  }

  kitchenConfirm(confirm: any) {
    if (confirm == 'yes') {
      this.cartData = [];
      this.cartProduct = [];
      this.cartQuantity = 0;
      localStorage.setItem("cartData", JSON.stringify(this.cartData));
      localStorage.setItem("cartProduct", JSON.stringify(this.cartProduct));
      this.kitchenAlert = false;
      this.addCart(this.selectedData, "");
    }
  }

  toggleFavorite(data: any, type: any, event?: MouseEvent,) {
    if (!this.currentUser || !this.currentUser._id) {
      this.openLoginPopup().then((user: any) => {
        if (user && user._id) {
          this.currentUser = user;
          this.runToggleFavorite(data, type, event);
        }
      });
    } else {
      this.runToggleFavorite(data, type, event);
    }
  }

  openLoginPopup(): Promise<any> {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(FavoriteLoginComponent, {
        data: {
          isFav: true
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
            resolve(result);
        } else {
          resolve(null);
        }
      });
    });
  }

  runToggleFavorite(data: any, type: any, event?: MouseEvent,) {
  let icon;
  if(data.offerName){
    type = "offer"
  }
  if(event){
    const target = event.target as HTMLElement;
    icon = target.closest('svg');
  }

  if (!this.favoriteIds.includes(data._id)) {
    this.favoriteIds.push(data._id);
    if (type == "offer") {
      this.favorite.push(data);
    } else if (type == "product") {
      this.favoriteProduct.push(data);
    } else {
      this.favoriteKitchen.push(data);
    }
    if(event){
      icon?.classList.remove('inActive-fav');
      icon?.classList.add('active-fav');
    }
  
  } else {
    if (type == "offer") {
      this.favorite = this.favorite.filter((fav: any) => fav._id !== data._id);
    } else if (type == "product") {
      this.favoriteProduct = this.favoriteProduct.filter((fav: any) => fav._id !== data._id);
    } else {
      this.favoriteKitchen = this.favoriteKitchen.filter((fav: any) => fav._id !== data._id);
    }
    this.favoriteIds = this.favoriteIds.filter((id: any) => id !== data._id);
    if(event){
      icon?.classList.remove('active-fav');
    icon?.classList.add('inActive-fav');
    }
  }

  let query = {
    favoriteId: this.favoriteIds,
    userId: this.currentUser._id
  };

  this.mainService.createFav(query).then(result => {
    localStorage.setItem("favoritsIds", JSON.stringify(this.favoriteIds));
    if (type == "offer") {
      localStorage.setItem("favoriteOffers", JSON.stringify(this.favorite));
    } else if (type == "product") {
      localStorage.setItem("favoriteProduct", JSON.stringify(this.favoriteProduct));
    } else {
      localStorage.setItem("favoriteKitchen", JSON.stringify(this.favoriteKitchen));
    }
    this.cdr.detectChanges();

    this.messageService.sendMessage({ refresh: true });

  });
}
  getFav(id: any){
    // console.log(id,"id", this.favoriteIds.includes(id))
    return this.favoriteIds ? this.favoriteIds.includes(id) : false;
  }

  submitInquiry() {
    if (this.inquiryForm.valid) {
      let query = {
        name: this.inquiryForm.value.name,
        email: this.inquiryForm.value.email,
        phoneNumber: this.inquiryForm.value.phoneNumber,
        countryCode: this.inquiryForm.value.countryCode,
        message: this.inquiryForm.value.message,
        productId: this.selectedProduct._id,
        productName: this.selectedProduct.productName,
        kitchenId: this.kitchenDetail._id,
        kitchenName: this.kitchenDetail.kitchenName,
        userId: this.currentUser ? this.currentUser._id : null
      }
       this.mainService.createInquiry(query).then(result => {
        if(result.ERROR){
          this.toastr.error('Error!', result.ERROR);
        } else {
          this.toastr.success('Sucess!', ' created sucessflly');
        }

        this.inquiryForm.reset();
        this.isReset = false;
        setTimeout(() => {
          this.isReset = true;
        }, 0);
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

  onSearchChange(text: any){
     this.productService.getProducts({ kitchenId: this.kitchenDetail._id, searchVal: text }).then(result => {
        this.products = (result && result.products) ? result.products : [];
      });
  }

getFloor(num: number): number {
  return Math.floor(num);
}
writeReview() {
  // Handle click
}
getRatingBreakdown(reviews: { rating: number }[]): { stars: number, count: number }[] {
  const breakdown = [
    { stars: 5, count: 0 },
    { stars: 4, count: 0 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 }
  ];
  for (const review of reviews) {
    const idx = 5 - review.rating; // 5 star at idx 0, 4 star at idx 1, etc
    if (review.rating >= 1 && review.rating <= 5) {
      breakdown[5 - review.rating].count++;
    }
  }
  return breakdown;
}

slides = [
  {
    imagePath: 'offers/1746029036256.jpg',
    // plus any other banner data if needed
  },
  {
    imagePath: 'offers/1760177603924.jpg',
  }
];

currentSlide = 0;

prevSlide() {
  this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
}

nextSlide() {
  this.currentSlide = (this.currentSlide + 1) % this.slides.length;
}

goToSlide(idx: number) {
  this.currentSlide = idx;
}
  sortOption = 'featured';

  sortOptionsKtc = [
    { value: 'featured', label: 'Featured' },
    { value: 'bestSelling', label: 'Best selling' },
    { value: 'aToZ', label: 'Alphabetically, A–Z' },
    { value: 'zToA', label: 'Alphabetically, Z–A' },
    { value: 'lowToHigh', label: 'Price, low to high' },
    { value: 'highToLow', label: 'Price, high to low' },
    { value: 'oldToNew', label: 'Date, old to new' },
    { value: 'newToOld', label: 'Date, new to old' }
  ];
  filteredProducts: any[] = [];

  sortProducts() {
    this.productService.getProducts({kitchenId:this.kitchenDetail._id, searchVal : this.searchSelection.productName, sortOption: this.sortOption}).then(result => {
        this.products = (result && result.products) ? result.products : [];
      });
  }

    applyFilter(filters: any) {
    this.filteredProducts = this.products.filter(p => {
      const matchAvailability =
        !filters.availability ||
        (filters.availability === 'inStock' && p.inStock) ||
        (filters.availability === 'outOfStock' && !p.inStock);
      const matchPrice = p.price >= filters.price.min && p.price <= filters.price.max;
      return matchAvailability && matchPrice;
    });
  }
}
