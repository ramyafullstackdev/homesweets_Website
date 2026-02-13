import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, debounceTime, map, startWith, takeUntil } from 'rxjs';
import { MessageService } from '../services';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { CartSummaryComponent } from '../cart-summary/cart-summary.component';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { OrderService } from '../order/order.service';
import { FormControl, FormBuilder } from '@angular/forms';
import { KitchenService } from '../kitchen/kitchen.service';
import { environment } from 'src/environments/environment';
import * as _ from "lodash";
import { ToastrService } from 'ngx-toastr';
import { MainService } from '../main/main.service';
import { CartService } from '../cart-summary/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { CartModalComponent } from '../cart-modal/cart-modal.component';
@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	providers:[OrderService, KitchenService, MainService, CartService]
})
export class HeaderComponent {
	navLinks: any[];
	activeLinkIndex = -1;
	enableMenu: Boolean = true;
	cartData!: any[];

	user!: SocialUser | null;
	loggedIn!: boolean;
	currentUser: any = {};
	filteredSearch!: Observable<any[]>;
	searchResult: any[] = [];
	s3ApiUrl = environment.s3Api;

	searchFormGroup = this._formBuilder.group({
		searchCtrl: new FormControl('')
	})
	totalCount: any;
	private unsubscribe = new Subject<void>();
    totalFav: any;
	showSearchOverlay = false;
	@ViewChild('overlay') overlayRef!: ElementRef;
	
  searchQuery = '';

  trendingTags = ['Sweets', 'Cookies', 'New Launches','Healthy'];
  s3URL: any = environment.s3Url
  recommendedProducts: any = [ ];
  categories:any[] = [];
  wellnessCategories:any[] = [];
  specialCategories:any[] = [];
//     categories = [
//     { name: 'Sweets', icon: 'fa-solid fa-candy-cane' },
//     { name: 'Cakes', icon: 'fa-solid fa-birthday-cake' },
//     { name: 'Cookies', icon: 'fa-solid fa-cookie-bite' },
//     { name: 'Snacks', icon: 'fa-solid fa-bowl-rice' },
//     { name: 'Chocolates', icon: 'fa-solid fa-gift' }
//   ];
  closeOverlay() {
  setTimeout(() => {
    const activeElement = document.activeElement;
    const overlayElement = this.overlayRef?.nativeElement;

    if (overlayElement && overlayElement.contains(activeElement)) {
      // Don't close if focus is still inside the overlay
      return;
    }

    this.showSearchOverlay = false;
  }, 100); // Delay to allow click to register
}
	constructor(public router: Router,
		private cd: ChangeDetectorRef,
		private kitchenService: KitchenService,
		private messageService: MessageService,
		private _formBuilder: FormBuilder,
		private authService: SocialAuthService,
		private orderService: OrderService,
		public offcanvasService: NgbOffcanvas,
		private mainService: MainService,
		private toastr : ToastrService,
		private cartService : CartService,
		public dialog: MatDialog
	    ) {
		this.navLinks = []
		this.messageService
			.getMessage()
			.pipe(takeUntil(this.unsubscribe))
			.subscribe((data) => {
				if (data && data.refresh == true) {
					this.ngOnInit();
				}
				if(data && data.key == 'headerCart'){
					this.ngOnInit();
				}
				let temp = localStorage.getItem("loggedIn");
				this.loggedIn = temp ? true : false;
				this.ngOnInit();
			});

			this.messageService
			.getMessageCategory()
			.pipe(takeUntil(this.unsubscribe))
			.subscribe((data) => {
				if (data && data.isFav) {
					let totalFav = localStorage.getItem("favoritsIds");
					this.totalFav = (totalFav ? JSON.parse(totalFav) : []).length;
				}
			});
		this.authService.authState.subscribe((user) => {
			this.user = user;
			let userObj = {
				email: user.email,
				password: user.idToken,
				firstName: user.firstName,
				lastName: user.lastName,
				phoneNumber: user.email
			}
			this.orderService.createCustomer(userObj).subscribe({
				next: (result) => {
					let response = result.response;
					if (response.isExist) {
						localStorage.setItem("loggedIn", "true")
						localStorage.setItem("currentUser", JSON.stringify(response.data));
					} else {
						localStorage.setItem("loggedIn", "true")
						localStorage.setItem("currentUser", JSON.stringify(response));

					}
					this.ngOnInit();

				},
				error: (e) => console.error(e),
				complete: () => console.info('complete')
			});
		});
	}
	ngOnDestroy() {
		this.unsubscribe.next();
		this.unsubscribe.complete();
	}

	ngOnInit() {

		if (!this.loggedIn) {
			let temp = localStorage.getItem("loggedIn");
			this.loggedIn = temp ? true : false;
		}
		let tempVal = localStorage.getItem("currentUser");
		this.currentUser = tempVal ? JSON.parse(tempVal) : {};

		this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
		let cartDetail = localStorage.getItem("cartData");
		this.cartData = cartDetail ? JSON.parse(cartDetail) : [];
		let totalFav = localStorage.getItem("favoritsIds");
		this.totalFav = (totalFav ? JSON.parse(totalFav) : []).length;
		this.getCategory()
		this.calculateQty();
		this.kitchenService.getSearchData({ searchVal: "a" }).then(result => {
			this.searchResult = result.result;
			this.filteredSearch = this.searchFormGroup.controls["searchCtrl"].valueChanges.pipe(
				debounceTime(1500),
				startWith(''),
				map(state =>
					(state ? this._filterStates(state) : this.searchResult.slice())
				),
			);
		});

		this.mainService.getOffers().then(result => {
			this.recommendedProducts = (result && result.offers) ? result.offers : [];
		});
	}

	calculateQty() {
		let qty = _.map(this.cartData, "quantity");
		this.totalCount = qty.reduce((a, b) => parseInt(a) + parseInt(b), 0);
		this.cd.detectChanges();
	}
	onActive(route: string) {
		this.router.navigate([route])
	}

	changeOfRoutes() {
		if (this.router.url == '/order') {
			this.enableMenu = false;
		} else {
			this.enableMenu = true;
		}
	}
	open(isCard: any, totalfav?:any) {
		const offcanvasRef = this.offcanvasService.open(CartSummaryComponent, { position: 'end' });
		offcanvasRef.componentInstance.isCart = isCard; // or false
	}
	
	logout() {
		localStorage.clear();
		let obj = {
			refresh: true
		}
		this.messageService.sendMessage(obj);
		this.router.navigate(['']);
	}

	adminLogout() {
		localStorage.removeItem('adminLoggedIn');
		this.router.navigate(['/admin-login']);
	}

	selectedOption(option: any) {
		localStorage.setItem("searchSelection", JSON.stringify(option));
		localStorage.setItem("fromSearch", "true");
		if (option.productName) {
			let category = option.category;
			let categoryName = category ? category.categoryName.toLowerCase() : 'products';
			this.router.navigate([categoryName]);

		} else {
			localStorage.setItem("selectedKitchen", JSON.stringify(option));
			this.router.navigate(['products']);

		}


	}

	redirect() {
		localStorage.removeItem("fromSearch");
	}

	private _filterStates(value: string): any[] {
		const filterValue = value.toLowerCase();
		this.kitchenService.getSearchData({ searchVal: filterValue }).then(result => {
			this.searchResult = result.result || [];
		});
		return this.searchResult ? this.searchResult.filter((item: any) => {
			const name = (item.productName || item.kitchenName || '').toLowerCase();
			return name.includes(filterValue);
		}) : [];
	}

	getCategory() {
		this.kitchenService.getAllParentCategories().subscribe({
			next: (result) => {
				let response = result.response;
				this.categories = response.category;
				this.wellnessCategories = response.wellness;
				this.specialCategories = response.special;
				// this.navLinks = response.map((item: any, index: any) => ({
				// 	label: item.categoryName,
				// 	link: `/${item.categoryName.toLowerCase().replace(/\s+/g, '_')}`,
				// 	index: index + 1
				// }));

				// this.navLinks.unshift({
				// 	label: 'Home',
				// 	link: './',
				// 	index: 0
				// });
			},
			error: (e) => console.error(e),
			complete: () => console.info('complete')
		});
	}

	redirectCategory(type: string, categoryName?: string) {
		if (categoryName) {
			this.router.navigate([`/${type}`], { queryParams: { id: categoryName } });
		} else {
			this.router.navigate([`/${type}`]);
		}
	}

	onSelectWeight(offer: any, index: any) {
		offer.prices[index.target.value]= {
			...offer.prices[index.target.value],
			selected: true
		}

		for (let i = 0; i < offer.prices.length; i++) {
			if (i != index.target.value) {
				offer.prices[i]= {
			...offer.prices[i],
			selected: false
		}
			}
		}
	}
	getCurrentWeightPrice(offer: any) {
		const selectedPrice = offer.prices.find((price: any) => price.selected);
		return selectedPrice ? selectedPrice : offer.prices[0];
	}
  
	addToCart(offer: any) {
		this.dialog.open(CartModalComponent, {
			data: { cartCount: 1 },
			panelClass: 'cart-modal-panel'
		});
		this.cartService.addToCart(offer, 'offer')
			.then((data) => {
				this.messageService.sendMessage({ refresh: true });

			})
	}

	onEnterPress() {
		if (this.searchQuery && this.searchQuery.trim()) {
			this.router.navigate(['/globalSearch'], { queryParams: { q: this.searchQuery.trim() } });
		    this.showSearchOverlay = false;
		}
	}

}
