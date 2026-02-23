import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { MainService } from './main.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as _ from "lodash";
import { MessageService } from '../services';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ReviewDialogComponent } from '../review-dialog/review-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { FavoriteLoginComponent } from '../favorite-login/favorite-login.component';
import { DialogViewComponent } from '../dialog-view/dialog-view.component';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../cart-summary/cart.service';
import { CartModalComponent } from '../cart-modal/cart-modal.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [MainService]
})
export class MainComponent {
  categoryList!: any[];
  banners!: any[];
  bestSeller!: any[];
  offers!: any[];
  newKitchens!: any[];
  bestKitchens!: any[];
  baseUrl: any = environment.baseUrl;
  s3URL: any = environment.s3Url
  s3ApiUrl: any = environment.s3Api;

  cartData!: any[];
  cartProduct!: any[];
  cartQuantity: any;
  kitchenAlert: Boolean = false;
  selectedData: any = {};
  imageToShow: any;
  reviews : any[] = [];

  categories = [
  { icon: 'volunteer_activism', label: 'Exclusive' },
  { icon: 'card_giftcard', label: 'Combos' },
  { icon: 'storefront', label: 'Explore Sellers' },
  { icon: 'auto_awesome', label: 'Pre-Orders' },
  { icon: 'currency_rupee', label: 'Under ₹499' },
  { icon: 'currency_rupee', label: 'New Launches' },
  { icon: 'inventory_2', label: 'All Products' }
];

selectCategory(category: string) {
  this.selectedCategory = category;
  this.bestSeller = this.bestSellerCopy.filter((item) => {
    return item.product.mainCategory && item.product.mainCategory.categoryName === this.selectedCategory.categoryName;
  });
}


  stars = Array(5).fill(0);
  favorite: any[] = [];
  private unsubscribe = new Subject<void>();
  isReset: boolean = true
  currentUser: any;
  favoriteProduct: any[] = [];
  favoriteKitchen: any[] = [];
  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;
  @ViewChild('scrollContainer2', { static: true }) scrollContainer2!: ElementRef;
  @ViewChild('scrollContainer3', { static: true }) scrollContainer3!: ElementRef;
  @ViewChild('scrollContainer4', { static: true }) scrollContainer4!: ElementRef;
  @ViewChild('scrollContainer5', { static: true }) scrollContainer5!: ElementRef;
  @ViewChild('scrollContainer6', { static: true }) scrollContainer6!: ElementRef;

  scrollContainers: any[] = [];
  buttonStates: { showLeft: boolean; showRight: boolean }[] = [];
  bestSellersCategories: any[] = [];
  selectedCategory : any; // default selection
  bestSellerCopy: any[] = [];
  constructor(private mainService: MainService, private cdr: ChangeDetectorRef,
    private messageService: MessageService, private toastr: ToastrService,
    private router: Router, public domSanitizer: DomSanitizer, private dialog: MatDialog,
    private cartService: CartService) {
    // this.favoriteIds = JSON.parse(localStorage.getItem("favoritsIds") || '[]');
    let fav = localStorage.getItem("favoriteData") ? localStorage.getItem("favoriteData") : '[]'
    this.favorite = JSON.parse(fav || '[]')
    this.messageService.getMessageCategory()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data) => {
        if (data && data.isFav) {
          this.isReset = false;
          this.favoriteIds = JSON.parse(localStorage.getItem("favoritsIds") || '[]');
          let query = {
            favoriteId: this.favoriteIds,
            userId: this.currentUser._id
          }
          this.mainService.createFav(query).then(result => {
            setTimeout(() => {
              this.isReset = true;
            }, 100);
            this.getfavorite()
          })
        }
      })
    this.messageService
      .getMessage()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data) => {
        if (data && data.mainRefresh == true) {
          this.cartData = data.cartData;
        }
        if (data && data.refresh == true) {
          this.cartData = JSON.parse(localStorage.getItem("cartData") || "[]");
        }
      });

    this.cartService.cartUpdated$.subscribe(() => {
      this.cartData = JSON.parse(localStorage.getItem("cartData") || "[]");
    });
  }

  ngOnInit() {
    // this.toastr.success('Sucess!', 'Order created sucessflly', {
    //   timeOut: 300000,
    // });
    this.scrollContainers = [
      this.scrollContainer,
      this.scrollContainer2,
      this.scrollContainer3,
      this.scrollContainer4,
      this.scrollContainer5,
      this.scrollContainer6
    ];

    // Initialize button states for each container
    this.buttonStates = this.scrollContainers.map(() => ({
      showLeft: false,
      showRight: false
    }));

    localStorage.removeItem("currentCategory");
    localStorage.removeItem("selectedProduct");
    let cartDetail = localStorage.getItem("cartData");
    let cartProduct = localStorage.getItem("cartProduct");
    this.cartData = cartDetail ? JSON.parse(cartDetail) : [];
    this.cartProduct = cartProduct ? JSON.parse(cartProduct) : [];
    this.currentUser = JSON.parse(localStorage.getItem("currentUser") || "[]")
    this.getfavorite()

    this.mainService.getCategory({mainDisplay:true}).then(result => {
      this.categoryList = result;
      let navLinks = this.categoryList.map((item: any, index: any) => ({
        label: item.categoryName,
        // link: `/${item.categoryName.toLowerCase()}`,
        link: `/${item.categoryName.toLowerCase().replace(/\s+/g, '_')}`,
        index: index + 1 // Start from 1 (or use index directly if 0-based)
      }));

      // Optionally add "Home" at the beginning
      navLinks.unshift({
        label: 'Home',
        link: './',
        index: 0
      });
      this.detectScroll()
      this.messageService.sendMessageCategory({ isCateory: true, navLinks: navLinks });
    });
    this.mainService.getBanners().then(result => {
      this.banners = (result && result.banners) ? result.banners : [];
      // _.forEach(this.banners, (item)=>{
      //   this.getS3File(item,item.imagePath , "imageFile");
      // })
    });
    this.mainService.getBestSellers().then(result => {
      this.bestSeller = (result && result.kitchens) ? result.kitchens : [];
      this.bestSellerCopy = (result && result.kitchens) ? result.kitchens : [];
      let categories = this.bestSeller.map(item => {
        return {
          categoryName: item.product.mainCategory ? item.product.mainCategory.categoryName : "",
          categoryId: item.product.mainCategory ? item.product.mainCategory._id : ""
        }
      });
      this.bestSellersCategories = _.uniqBy(categories, 'categoryId');
      this.selectedCategory = this.bestSellersCategories[0];
      this.bestSeller = this.bestSeller.filter((item) => {
        return item.product.mainCategory && item.product.mainCategory.categoryName === this.selectedCategory.categoryName;
      });
      this.detectScroll()
    });
    this.mainService.getOffers().then(result => {
      this.offers = (result && result.offers) ? result.offers : [];
      this.detectScroll()
    });
    this.mainService.getNewKitchens().then(result => {
      this.newKitchens = (result && result.kitchens) ? result.kitchens : [];
      this.detectScroll()

    });
    this.mainService.getBestKitchens().then(result => {
      this.bestKitchens = (result && result.kitchens) ? result.kitchens : [];
      this.detectScroll()
    });

    this.mainService.getAllUserReview({ limit: 20, offset:0, reviewType: "product" , rating: 5}, '', '').subscribe({
      next: (result) => {
        console.log(result);
        this.reviews = result.reviews;
        console.log(this.reviews, ">>reviews");
      },
      error: (e) => {
        console.error(e)
      
      },
      complete: () => console.info('complete')
    })
  }
  setDefaultImage(event: any) {
  event.target.src = 'assets/images/donatee.png';
}

  getfavorite() {
    if (this.currentUser?._id) {
      this.mainService.getfav(this.currentUser?._id).then(result => {
        this.favoriteIds = result.favoriteId || [];
        this.favorite = result.offers || [];
        this.favoriteProduct = result.products || [];
        this.favoriteKitchen = result.kitchens || []
        localStorage.setItem("favoritsIds", JSON.stringify(this.favoriteIds || []));
        localStorage.setItem("favoriteOffers", JSON.stringify(this.favorite || []));
        localStorage.setItem("favoriteProduct", JSON.stringify(this.favoriteProduct || []))
        localStorage.setItem("favoriteKitchen", JSON.stringify(this.favoriteKitchen || []))

      });
    }

  }
  getImage(item: any) {
    this.mainService.getFile({ path: item.imagePath }).subscribe({
      next: (result) => {
        this.createImageFromBlob(result, item);
      },
      error: (e) => console.error(e),
      complete: () => console.info('complete')
    });
  }

  getS3File(item: any, path: any, image: any) {
    this.mainService.getS3File({ s3Path: path }).subscribe({
      next: (result) => {
        let reader = new FileReader();
        reader.addEventListener("load", () => {
          item[image] = reader.result;
        }, false);
        // return result;
        // this.createImageFromBlob(result,item);
      },
      error: (e) => console.error(e),
      complete: () => console.info('complete')
    });
  }

  createImageFromBlob(image: Blob, item: any) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      item.bannerImage = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }
  //   addCart(product: any, kitchen:any) {
  //     this.selectedData = product;
  //     console.log(this.cartProduct,">>>this.cartProduct")
  //     console.log(product,">>>product")
  //     console.log(this.cartProduct.includes(product),">>>this.cartProduct.includes(product)")
  //     if(this.cartProduct.includes(product)) {
  //       let kitchenIndex = _.findIndex(this.cartData, {userId: product.userId});
  //       let existIndex = _.findIndex(this.cartData, {productName:product.productName,
  //         productImagePath:product.productImagePath,
  //         productDescription:product.productDescription,productCurrentPrice:product.productCurrentPrice})
  //         this.cartData[existIndex].quantity =  this.cartData[existIndex].quantity+1;
  //         this.cartQuantity =this.cartData[existIndex].quantity;
  //         // this.cartData.push(existProduct[0]);

  //     }else{
  //       let kitchenIndex = _.findIndex(this.cartData, {userId: product.userId});
  //       if(kitchenIndex == -1&& this.cartData && this.cartData.length > 0) {
  //         this.kitchenAlert = true;
  //       }else{
  //         this.cartProduct.push(product);
  //         this.cartData.push({
  //           productName:product.productName,
  //           productImagePath:product.productImagePath,
  //           productDescription:product.productDescription,
  //           productCurrentPrice:product.productCurrentPrice,
  //           discount: product.productDiscount,
  //           quantity :1,
  //           userId: product.userId
  //         });
  //         this.cartQuantity = 1;
  //       }
  //     }
  //     localStorage.setItem("cartData", JSON.stringify(this.cartData));
  //     localStorage.setItem("cartProduct", JSON.stringify(this.cartProduct));
  //     this.messageService.sendMessage({refresh:true});

  //   }

  // async addCart(productParam: any, kitchen: string) {
  //   let product = JSON.parse(JSON.stringify(productParam));

  //   console.log('product add to cart ', product);

  //   if (kitchen !== 'offer') {
  //     const selectedPrice = product.prices.length > 1 ? product.prices[product.prices.length % 2] : product.prices[0];

  //     product.productCurrentPrice = await this.currentPriceCalculation(selectedPrice.productPrice, product.productDiscount);
  //     product.productWeight = selectedPrice.weight;
  //   } else if (kitchen === 'offer') {
  //     const selectedPrice = product.prices.length > 1 ? this.getLeastWeight(product.prices) : product.prices[0];

  //     product.productCurrentPrice = selectedPrice.currentPrice;
  //     product.productWeight = selectedPrice.weight;
  //   } else {
  //     product['quantity'] = 1;
  //   }

  //   console.log(this.cartProduct, ">>>this.cartProduct")
  //   console.log(product, ">>>product")

  //   console.log(this.cartProduct.includes(product), ">>>this.cartProduct.includes(product)");

  //   this.selectedData = product;


  //   const indexExists = this.cartData.findIndex((cart) => {
  //     return (cart.productId === product._id) && (cart.productWeight === product.productWeight)
  //   });


  //   if (indexExists !== -1) {

  //     this.cartData[indexExists].quantity = this.cartData[indexExists].quantity ? this.cartData[indexExists].quantity + 1 : product.quantity ? product.quantity : 1;
  //     this.cartData[indexExists].productWeight = product.productWeight;
  //     this.cartData[indexExists].productCurrentPrice = product.productCurrentPrice;

  //     this.cartQuantity = this.cartData[indexExists].quantity;
  //   } else {
  //     this.cartProduct.push(product);
  //     this.cartData.push({
  //       productId: product._id,
  //       productName: product.productName,
  //       productImagePath: product.productImagePath,
  //       productDescription: product.productDescription,
  //       productCurrentPrice: product.productCurrentPrice,
  //       discount: product.productDiscount,
  //       quantity: product.quantity ? product.quantity : 1,
  //       userId: product.userId,
  //       productWeight: product.productWeight,
  //       preOrder: product.preOrder
  //     });

  //     this.cartQuantity = product.quantity ? product.quantity : 1;
  //   }

  //   localStorage.setItem("cartData", JSON.stringify(this.cartData));
  //   localStorage.setItem("cartProduct", JSON.stringify(this.cartProduct));
  //   this.messageService.sendMessage({ refresh: true });

  // }

  // async addCart(productParam: any, kitchen: string, kitchenData?: any) {
  //   let product = JSON.parse(JSON.stringify(productParam));

  //   if (kitchen !== 'offer') {
  //     const selectedPrice = product.prices.length > 1
  //       ? product.prices[product.prices.length % 2]
  //       : product.prices[0];

  //     product.productCurrentPrice = await this.currentPriceCalculation(
  //       selectedPrice.productPrice,
  //       product.productDiscount
  //     );
  //     product.productWeight = selectedPrice.weight;
  //   } else {
  //     const selectedPrice = product.prices.length > 1
  //       ? this.getLeastWeight(product.prices)
  //       : product.prices[0];

  //     product.productCurrentPrice = selectedPrice.currentPrice;
  //     product.productWeight = selectedPrice.weight;
  //   }

  //   product.quantity = product.quantity || 1;
  //   this.selectedData = product;

  //   // Find if product already exists in cartData
  //   const indexExists = this.cartData.findIndex((cart) =>
  //     cart.productId === product._id && cart.productWeight === product.productWeight
  //   );

  //   if (indexExists !== -1) {
  //     this.cartData[indexExists].quantity += 1;
  //     this.cartData[indexExists].productCurrentPrice = product.productCurrentPrice;
  //     this.cartData[indexExists].productWeight = product.productWeight;
  //     this.cartQuantity = this.cartData[indexExists].quantity;
  //   } else {
  //     this.cartData.push({
  //       productId: product._id,
  //       productName: product.productName,
  //       productImagePath: product.productImagePath,
  //       productDescription: product.productDescription,
  //       productCurrentPrice: product.productCurrentPrice,
  //       discount: product.productDiscount,
  //       quantity: product.quantity,
  //       userId: product.userId,
  //       productWeight: product.productWeight,
  //       preOrder: product.preOrder,
  //       kitchenId : kitchenData ? kitchenData._id : product.userId,
  //       kitchenName : kitchenData ? kitchenData.kitchenDetails.kitchenForm.kitchenName : 'Offers'
  //     });
  //     this.cartQuantity = product.quantity;
  //   }

  //   // 🔄 Group products by kitchen
  //   const groupedByKitchen = this.groupCartByKitchen(this.cartData);

  //   // 🧾 Construct payload
  //   const cartPayload = {
  //     user_id: this.currentUser._id,
  //     cart_items: groupedByKitchen
  //   };

  //   // 📤 Send to backend
  //   this.mainService.createCart(cartPayload).then(result => {
  //     localStorage.setItem("cartData", JSON.stringify(this.cartData));
  //     localStorage.setItem("cartProduct", JSON.stringify(this.cartProduct));

  //     this.cdr.detectChanges();
  //     this.messageService.sendMessage({ refresh: true });
  //   });
  // }
  // groupCartByKitchen(cartData: any[]) {
  //   const grouped: any = {};

  //   cartData.forEach(item => {
  //     const kitchenId = item.kitchenId || 'default';
  //     const kitchenName = item.kitchenName || 'Unknown Kitchen';

  //     if (!grouped[kitchenId]) {
  //       grouped[kitchenId] = {
  //         kitchen_id: kitchenId,
  //         kitchen_name: kitchenName,
  //         items: []
  //       };
  //     }

  //     grouped[kitchenId].items.push({
  //       product_id: item.productId,
  //       name: item.productName,
  //       qty: item.quantity,
  //       price: item.productCurrentPrice
  //     });
  //   });

  //   return Object.values(grouped);
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

  viewProducts(kitchen: any) {
    localStorage.setItem("selectedKitchen", JSON.stringify(kitchen));
    this.router.navigate(['products']);
  }
  viewDetailProduct(product: any, routeFrom: any) {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    localStorage.setItem("routeFrom", routeFrom);
    this.router.navigate(['products']);
  }

  getLeastWeight(data: any) {
    const leastWeightObj = data.reduce((min: { weight: string; }, item: { weight: string; }) => {
      const itemWeight = parseFloat(item.weight);
      const minWeight = parseFloat(min.weight);
      return itemWeight < minWeight ? item : min;
    });
    return leastWeightObj
  }

  viewAllProducts() {
    this.router.navigate(['products']);
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

  ngAfterViewInit() {
    this.detectScroll()
  }

  detectScroll() {
    this.buttonStates = this.scrollContainers.map(() => ({
      showLeft: false,
      showRight: false
    }));

    this.scrollContainers.forEach((container, index) => {
      this.updateButtonState(index);
      container.nativeElement.addEventListener('scroll', () => {
        this.updateButtonState(index);
      });
    });
  }

  updateButtonState(index: number) {
    const el = this.scrollContainers[index].nativeElement;
    const scrollLeft = el.scrollLeft;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    this.buttonStates[index].showLeft = scrollLeft > 0;
    this.buttonStates[index].showRight = scrollLeft < maxScrollLeft - 1;
    this.cdr.detectChanges()
  }

  scroll(direction: 'left' | 'right', index: number) {
    const scrollAmount = direction === 'left' ? -266 : 266;
    this.scrollContainers[index].nativeElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    this.updateButtonState(index);

  }


  openReviewDialog(review: any) {
    this.dialog.open(ReviewDialogComponent, {
      data: {
        name: review.titleReview,
        image: review.imagePath,
        comment: review.review,
        productUrl: review.productUrl,
        fullStars: this.getFullStars(review.rating || 0),
        halfStar: this.hasHalfStar(review.rating || 0),
        emptyStars: this.getEmptyStars(review.rating || 0),
        product: review.productId,
        date: review.createdOn || "2022-10-27T00:00:00Z",
      },
      panelClass: 'custom-dialog-panel'
    });
  }

  favoriteIds: any = [];
  toggleFavorite(data: any, event: MouseEvent, type: any) {
    if (!this.currentUser || !this.currentUser._id) {
      this.openLoginPopup().then((user: any) => {
        if (user && user._id) {
          this.currentUser = user;
          this.runToggleFavorite(data, event, type);
        }
      });
    } else {
      this.runToggleFavorite(data, event, type);
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

  runToggleFavorite(data: any, event: MouseEvent, type: any) {
    const target = event.target as HTMLElement;
    const icon = target.closest('svg');

    if (!this.favoriteIds.includes(data._id)) {
      this.favoriteIds.push(data._id);
      if (type == "offer") {
        this.favorite.push(data);
      } else if (type == "product") {
        this.favoriteProduct.push(data);
      } else {
        this.favoriteKitchen.push(data);
      }
      icon?.classList.remove('inActive');
      icon?.classList.add('active');
    } else {
      if (type == "offer") {
        this.favorite = this.favorite.filter((fav: any) => fav._id !== data._id);
      } else if (type == "product") {
        this.favoriteProduct = this.favoriteProduct.filter((fav: any) => fav._id !== data._id);
      } else {
        this.favoriteKitchen = this.favoriteKitchen.filter((fav: any) => fav._id !== data._id);
      }
      this.favoriteIds = this.favoriteIds.filter((id: any) => id !== data._id);
      icon?.classList.remove('active');
      icon?.classList.add('inActive');
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

  getFav(id: any) {
    return this.favoriteIds ? this.favoriteIds.includes(id) : false;
  }

  @ViewChild('openModel', { static: false }) openModel!: ElementRef<HTMLButtonElement>;
  @ViewChild('addcartModel', { static: false }) addcartModel!: ElementRef<HTMLButtonElement>;

  openDialog(element: any, type: any, clickType: any, selectedWeight?: any): void {
    let prodWeight = this.getLeastWeight(element.prices).weight
    const indexExists = this.cartData.findIndex((cart) => {
      return (cart.productId === element._id) && (cart.productWeight === prodWeight)
    });
    console.log('indexExists', indexExists);
    let textCon = ''
    if (indexExists !== -1) {
      textCon = "This product is already in your cart.";
    } else {
      textCon = "Product Successfully added to cart";
    }
    if (clickType == 'Pre-Order') {
      this.viewDetailProduct(element, 'offers')
      const dialogRef = this.dialog.open(DialogViewComponent, {
        data: {
          message: "This product is available for pre-order only. Do you want to continue?",
          yes: true
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // this.openModel.nativeElement.click();
          // const headerSpan = this.addcartModel.nativeElement.getElementsByClassName("header-span")[0];
          // if (headerSpan) {
          //   headerSpan.textContent = textCon;
          // }
          this.dialog.open(CartModalComponent, {
            data: { cartCount: 1 },
            panelClass: 'cart-modal-panel'
          });
          this.addCart(element, type);
        }
      });
    } else {
      // this.openModel.nativeElement.click();
      // const headerSpan = this.addcartModel.nativeElement.getElementsByClassName("header-span")[0];
      // if (headerSpan) {
      //   headerSpan.textContent = textCon;
      // }
      this.dialog.open(CartModalComponent, {
        data: { cartCount: 1 },
        panelClass: 'cart-modal-panel'
      });
      this.addCart(element, type);
    }
  }

  onSelectWeight(offer: any, index: any) {
    console.log(offer,'weight selected', index.target.value);
    offer.prices[index.target.value]['selected'] = true;
    for (let i = 0; i < offer.prices.length; i++) {
      if (i != index.target.value) {
        offer.prices[i]['selected'] = false;
      }
    }
  }
  isInCart(product: any): boolean {
    const selectedWeight = this.getCurrentWeightPrice(product)?.weight;
    return this.cartData ? this.cartData.some((item: any) =>
      item.productId === product._id && item.productWeight === selectedWeight
    ) : false;
  }

  getCartQuantity(product: any): number {
    const selectedWeight = this.getCurrentWeightPrice(product)?.weight;
    const item = this.cartData ? this.cartData.find((item: any) =>
      item.productId === product._id && item.productWeight === selectedWeight
    ) : null;
    return item ? item.quantity : 0;
  }

  increaseQty(product: any) {
    const selectedWeight = this.getCurrentWeightPrice(product)?.weight;
    const index = this.cartData.findIndex((item: any) =>
      item.productId === product._id && item.productWeight === selectedWeight
    );
    if (index !== -1) {
      this.cartData[index].quantity++;
      localStorage.setItem('cartData', JSON.stringify(this.cartData));
      if (this.currentUser?._id) {
        this.cartService.updateCartQuantity({ ...this.cartData[index] }, null, this.currentUser);
      }
      this.messageService.sendMessage({ refresh: true });
    }
  }

  decreaseQty(product: any) {
    const selectedWeight = this.getCurrentWeightPrice(product)?.weight;
    const index = this.cartData.findIndex((item: any) =>
      item.productId === product._id && item.productWeight === selectedWeight
    );
    if (index === -1) return;

    const cartItem = { ...this.cartData[index] };
    if (cartItem.quantity > 1) {
      this.cartData[index].quantity--;
      localStorage.setItem('cartData', JSON.stringify(this.cartData));
      if (this.currentUser?._id) {
        this.cartService.updateCartQuantity({ ...this.cartData[index] }, null, this.currentUser);
      }
    } else {
      this.cartData.splice(index, 1);
      this.cartService.removeItem(cartItem, this.currentUser || {}).catch(() => {
        this.cartData = JSON.parse(localStorage.getItem("cartData") || "[]");
      });
    }
    this.messageService.sendMessage({ refresh: true });
  }

  getCurrentWeightPrice(offer: any) {
    const selectedPrice = offer.prices.find((price: any) => price.selected);
    return selectedPrice ? selectedPrice : offer.prices[0];
  }

  redirectCategory(category: any, state: any) {
    const categoryName = category.toLowerCase().replace(/\s+/g, '_');
    console.log('Redirecting to category:', categoryName);
    this.router.navigate([`/${categoryName}`], { state: { from: state } });
  }
}
