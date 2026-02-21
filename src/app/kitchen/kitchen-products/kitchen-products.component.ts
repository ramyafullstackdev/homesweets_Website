import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { KitchenService } from '../kitchen.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services';
import { Subject, takeUntil } from 'rxjs';
import * as _ from "lodash";
import { environment } from 'src/environments/environment';
import { MainService } from 'src/app/main/main.service';
import { FavoriteLoginComponent } from 'src/app/favorite-login/favorite-login.component';
import { MatDialog } from '@angular/material/dialog';
import { CartService } from 'src/app/cart-summary/cart.service';

@Component({
  selector: 'app-kitchen-products',
  templateUrl: './kitchen-products.component.html',
  styleUrls: ['./kitchen-products.component.scss'],
  providers: [KitchenService, MainService]

})
export class KitchenProductsComponent {
  kitchens! : any[];
  otherKitchens: any =[];
  private unsubscribe = new Subject<void>();

  cartData!: any [];
  cartProduct!: any [];
  cartQuantity:any;
  selectedData: any ={};
  kitchenAlert: Boolean = false;
  baseUrl : any = environment.baseUrl;  
  s3URL :any = environment.s3Url;
  s3ApiUrl: any = environment.s3Api;
  currentRoute!: any ;
  searchSelection: any;
  favoriteIds: any[] = [];
  favorite: any[] = [];
  favoriteProduct: any[] = [];
  favoriteKitchen: any[] = [];
  currentUser: any;
  isReset: boolean = true;
  @ViewChild('addcartModel', { static: false }) addcartModel!: ElementRef<HTMLButtonElement>;
  
  constructor(private kitchenService: KitchenService, private mainService : MainService,public dialog: MatDialog,private cdr: ChangeDetectorRef,
    private router : Router,
    private messageService: MessageService, private cartService:CartService) {
    this.messageService
      .getMessage()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data) => {
        if (data && data.isFilter == true) {
          this.getFilterData(data.searchKey);
        }
        if (data && data.mainRefresh == true) {
          this.cartData = data.cartData;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
  }

  ngOnInit() {
    let cartDetail = localStorage.getItem("cartData");
    let cartProduct = localStorage.getItem("cartProduct");
    this.cartData = cartDetail ? JSON.parse(cartDetail) :[];
    this.cartProduct = cartProduct ? JSON.parse(cartProduct): [];
    let searchData = localStorage.getItem("searchSelection");
    this.searchSelection = searchData ?  JSON.parse(searchData) :  {};
    this.currentUser = JSON.parse(localStorage.getItem("currentUser") || "[]")
    this.getfavorite()
    console.log(this.router.url,">>>>kitchen router");
    this.currentRoute = this.router.url;
    let queryObj:any = {};
    queryObj["category"] =  this.currentRoute;
    console.log(this.searchSelection.productName,">>>>this.searchSelection.productName")
    if(this.searchSelection && this.searchSelection.productName){
      queryObj.searchName = this.searchSelection.productName;
    }
    if(this.searchSelection && this.searchSelection.productName){
      this.kitchenService.getKitchens(queryObj).then(result => {
        localStorage.setItem("kitchens", JSON.stringify(result.kitchens));
        this.kitchens = result.kitchens;
        console.log(this.kitchens,">>>>>>>>>>>kitchens")
      });
      queryObj.loadOthers = true;
      this.kitchenService.getKitchens(queryObj).then(result => {
        console.log(result,">>>>>search other result")
        this.otherKitchens = result.kitchens;
        // this.otherProducts = (result && result.products) ? result.products : [];
        // console.log(this.products);
      });
    }else {
      this.kitchenService.getKitchens(queryObj).then(result => {
        let kitchenData: any[] = [];
        result.kitchens.forEach((kitchen: any) => {
         let index = kitchenData.findIndex((k: any) => k.kitchen._id === kitchen.kitchen._id);
         if (index === -1) {
            kitchenData.push(kitchen);
         }
        })
        localStorage.setItem("kitchens", JSON.stringify(kitchenData));
        this.kitchens = result.kitchens;
        console.log(this.kitchens,">>>>>>>>>>>kitchens")
      });
    }
    this.favoriteIds = JSON.parse(localStorage.getItem("favoritsIds") || '[]');
    let fav = localStorage.getItem("favoriteData") ? localStorage.getItem("favoriteData") : '[]'
    this.favorite = JSON.parse(fav || '[]')

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

  getFilterData (searchVal:any) {
    console.log(searchVal,">>>searchVal")
    localStorage.setItem("searchKeyKitchen" , searchVal);

    if(searchVal == '') {
      this.ngOnInit()
    }else{
      let filteredProducts = _.filter(
        this.kitchens, function(el) {
          console.log(el,">>>ele")
          let products = _.filter(el.products, function(prod){
            return prod.productName.toLowerCase().includes(searchVal.toLowerCase())
          });
          el.products = products;
           return  products.length > 0;
        }
      );
      if(filteredProducts && filteredProducts.length == 0 ) {
        this.kitchens = _.filter(
          this.kitchens, function(el) {
            console.log(el,">>>ele")
             return  el.name.toLowerCase().includes(searchVal.toLowerCase());
          }
        );
      }else{
        this.kitchens = filteredProducts;
      }
    }


  }

  viewProducts() {
        this.router.navigate(['products']);
  }

  viewDetailProduct(product:any, kitchen:any){
    localStorage.setItem("selectedKitchen", JSON.stringify(kitchen.kitchen));
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    console.log(product,">>>>>>>product")
    this.router.navigate(['products']);
  }

  // addCart(product: any, kitchen:any) {
  //   debugger
  //   this.selectedData = product;
  //   console.log(this.cartProduct,">>>this.cartProduct")
  //   console.log(product,">>>product")
  //   console.log(this.cartProduct.includes(product),">>>this.cartProduct.includes(product)")
  //   if(this.cartProduct.includes(product) && this.cartData.length) {
  //     let kitchenIndex = _.findIndex(this.cartData, {userId: product.userId});
  //     let existIndex = _.findIndex(this.cartData, {productId: product._id, productWeight: product.prices[0].weight});
  //     let textCon = ''
  //       if (existIndex !== -1) {
  //         textCon = "This product is already in your cart.";
  //       } else {
  //         textCon = "Product Successfully added to cart";
  //       }
  //       const headerSpan = this.addcartModel.nativeElement.getElementsByClassName("header-span")[0];
  //       if (headerSpan) {
  //         headerSpan.textContent = textCon;
  //       } 
  //       this.cartData[existIndex].quantity =  this.cartData[existIndex].quantity+1;
  //       this.cartQuantity =this.cartData[existIndex].quantity;
  //       // this.cartData.push(existProduct[0]);

  //   } else {
  //     let kitchenIndex = _.findIndex(this.cartData, { userId: product.userId });
  //     if (kitchenIndex == -1 && this.cartData && this.cartData.length > 0) {
  //       this.kitchenAlert = true;
  //     } else {

  //       const indexExists = this.cartData.findIndex((cart) => {
  //         return (cart.productId === product._id) && (cart.productWeight === product.prices[0].weight)
  //       });

  //       let textCon = ''
  //       if (indexExists !== -1) {
  //         textCon = "This product is already in your cart.";
  //       } else {
  //         textCon = "Product Successfully added to cart";
  //       }
  //       const headerSpan = this.addcartModel.nativeElement.getElementsByClassName("header-span")[0];
  //       if (headerSpan) {
  //         headerSpan.textContent = textCon;
  //       } 
  //       if (indexExists !== -1) {

  //         this.cartData[indexExists].quantity = this.cartData[indexExists].quantity ? this.cartData[indexExists].quantity + 1  : 1;
  //         this.cartData[indexExists].productWeight = product.prices[0].weight;
  //         this.cartData[indexExists].productCurrentPrice = product.prices[0].productPrice;

  //         this.cartQuantity = this.cartData[indexExists].quantity;
  //       } else {
  //         this.cartProduct.push(product);
  //         this.cartData.push({
  //           productId: product._id,
  //           productName:product.productName,
  //           productImagePath:product.productImagePath,
  //           productDescription:product.productDescription,
  //           productCurrentPrice:product.prices[0].productPrice,
  //           productWeight:product.prices[0].weight,
  //           discount: product.productDiscount,
  //           quantity :1,
  //           userId: product.userId,
  //           preOrder: product.preOrder
  //         });
  //         this.cartProduct.push(product);


  //         this.cartQuantity = 1;
  //       }

  //       // this.cartProduct.push(product);
  //       // this.cartData.push({
  //       //   productName:product.productName,
  //       //   productImagePath:product.productImagePath,
  //       //   productDescription:product.productDescription,
  //       //   productCurrentPrice:product.prices[0].productPrice,
  //       //   productWeight:product.prices[0].weight,
  //       //   discount: product.productDiscount,
  //       //   quantity :1,
  //       //   userId: product.userId,
  //       //   preOrder: product.preOrder
  //       // });
  //       // this.cartQuantity = 1;
  //     }
  //   }
  //   localStorage.setItem("cartData", JSON.stringify(this.cartData));
  //   localStorage.setItem("cartProduct", JSON.stringify(this.cartProduct));
  //   this.messageService.sendMessage({refresh:true});

  // }

    addCart(product: any,kitchenData?: any) {
      this.cartService.addToCart(product, '', kitchenData, this.currentUser)
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
  kitchenConfirm(confirm:any) {
    if(confirm == 'yes'){
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
  console.log(data,"MainService")
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
    return this.favoriteIds ? this.favoriteIds.includes(id) : false;
  }

  mergeProductAndKitchen(product: any, kitchenVal: any) {
    return { ...product, kitchenVal };
  }

}
