import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CartModalComponent } from 'src/app/cart-modal/cart-modal.component';
import { MainService } from 'src/app/main/main.service';
import { MessageService } from 'src/app/services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  /** Input: Product data passed from parent */
  @Input() product: any;
  offers!: any[];
  s3ApiUrl: any = environment.s3Api;

  /** Output: Event emitter if you want to trigger actions (optional) */
  @Output() addToCart = new EventEmitter<any>();
  @Output() viewProduct = new EventEmitter<any>();
  @Input() sortOption: any;
  currentPage = 1;
  pageSize = 10; // number of offers per page
  totalPages = 0;
  totalRecords = 0;
  searchQuery: string = '';
  categoryName: string = '';
  categoryIds:any[] = [];
  availabilityFilter: any = {};
  priceRamge: any = { min: 0, max: 5000 };
  mainPageFilter: any;
  constructor(private mainService: MainService, private route: ActivatedRoute, private dialog: MatDialog, private messageService: MessageService, private router: Router) {
    const state = history.state;
    if (state && state.from === 'main') {
      this.mainPageFilter = this.router.url.replace(/^\//, "");;
    }
    this.route.queryParams.subscribe(params => {
      if(params['q']){
        this.searchQuery = params['q'] || '';
      } else if(params['id']){
        this.categoryName = params['id'] || '';
      }
      
      this.ngOnInit();
    });
    this.messageService
    .getMessage()
    .subscribe((data) => {
      if(data && data.category && data.product ){
        this.categoryName = "";
        this.categoryIds = data.categoryIds;
        this.loadProductsPage(this.currentPage, this.pageSize, "", this.categoryIds);
      }
      if(data && data.availability && data.product ){
        this.availabilityFilter = data.availabilityFilters;
        this.loadProductsPage(this.currentPage, this.pageSize, this.searchQuery, this.categoryIds);
      }

      if(data && data.price && data.product ){
        this.priceRamge = data.priceRange;
        this.loadProductsPage(this.currentPage, this.pageSize, this.searchQuery, this.categoryIds);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sortOption'] && !changes['sortOption'].firstChange) {
      this.loadProductsPage(this.currentPage, this.pageSize, this.searchQuery);
    }
  }
  ngOnInit() {
    // Sample offers data; in real scenario, this might come from @Input() or a service
    //     this.mainService.getOffers().then(result => {
    //   this.offers = (result && result.offers) ? result.offers : [];
    // });
    // this.mainService.getAllProdcts({}).then(result => {
    //   this.offers = (result && result.products) ? result.products : [];
    // });
     
    this.loadProductsPage(this.currentPage, this.pageSize, this.searchQuery);
  }

  loadProductsPage(page: number, pageSize: number, searchValue: any, categoryIds?: any[]) {
    this.currentPage = page;
    this.mainService.getAllProdcts({ page: this.currentPage, limit: pageSize, searchStr: searchValue, categoryName: this.categoryName, categoryIds, availability: this.availabilityFilter, priceRange: this.priceRamge, mainPageFilter: this.mainPageFilter, sortOption: this.sortOption })
      .then((resp: any) => {
        let response = resp;
        response.products.forEach((offer: any) => {
          if (!offer.prices || offer.prices.length === 0) {
            offer.disableCart = true;
            return;
          }
          offer.disableCart = offer.prices.every((price: any) => price.onStock === false);
          if(!offer.prices[0].onStock){
             offer.disableCart = true
          }
        });
        this.offers = response.products;
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
      });
  }

  nextPage() {
    if (this.currentPage < this.totalPages)
      this.loadProductsPage(this.currentPage + 1, this.pageSize, this.searchQuery);
  }

  prevPage() {
    if (this.currentPage > 1)
      this.loadProductsPage(this.currentPage - 1, this.pageSize, this.searchQuery);
  }

  onAddToCart(product: any) {
    this.dialog.open(CartModalComponent, {
      data: { cartCount: 1 },
      panelClass: 'cart-modal-panel'
    });
    this.addToCart.emit(product);
  }

  onViewProduct() {
    this.viewProduct.emit(this.product);
  }
  viewDetailProduct(product: any, routeFrom: any) {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    localStorage.setItem("routeFrom", routeFrom);
    this.router.navigate(['products']);
  }
    favoriteIds: any = [];
  toggleFavorite(data: any, event: MouseEvent, type: any) {
    // if (!this.currentUser || !this.currentUser._id) {
    //   this.openLoginPopup().then((user: any) => {
    //     if (user && user._id) {
    //       this.currentUser = user;
    //       this.runToggleFavorite(data, event, type);
    //     }
    //   });
    // } else {
    //   this.runToggleFavorite(data, event, type);
    // }
  }
  getFav(id: any) {
    return this.favoriteIds ? this.favoriteIds.includes(id) : false;
  }

    getLeastWeight(data: any) {
    if (!data || data.length === 0) return {};
    const leastWeightObj = data.reduce((min: { weight: string; }, item: { weight: string; }) => {
      const itemWeight = parseFloat(item.weight);
      const minWeight = parseFloat(min.weight);
      return itemWeight < minWeight ? item : min;
    });
    return leastWeightObj
  }
  getCurrentWeightPrice(offer: any) {
    if (!offer || !offer.prices || offer.prices.length === 0) return {};
    const selectedPrice = offer.prices.find((price: any) => price.selected);
    return selectedPrice ? selectedPrice : offer.prices[0];
  }
  disableCart: boolean = false;
  onSelectWeight(offer: any, index: any) {
    const idx = parseInt(index.target.value, 10);
    if (!offer.prices[idx] || !offer.prices[idx].onStock) {
      offer.disableCart = true;
    } else {
      offer.disableCart = false;
    }
    offer.prices[idx]['selected'] = true;
    for (let i = 0; i < offer.prices.length; i++) {
      if (i !== idx) {
        offer.prices[i]['selected'] = false;
      }
    }
  }
}
