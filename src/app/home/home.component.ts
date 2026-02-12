import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject,debounceTime, map, startWith, takeUntil } from 'rxjs';
import { MessageService } from '../services';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { CartSummaryComponent } from '../cart-summary/cart-summary.component';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { OrderService } from '../order/order.service';
import {FormControl,FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { KitchenService } from '../kitchen/kitchen.service';
import { environment } from 'src/environments/environment';
import * as _ from "lodash";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [OrderService,KitchenService]
})
export class HomeComponent {

  navLinks: any[];
  activeLinkIndex = -1;
  enableMenu: Boolean = true;
  cartData!:any[];
  
  user!: SocialUser | null; 
  loggedIn!: boolean;
  currentUser: any = {};
  filteredSearch!: Observable<any[]>;
  searchResult : any[] = [];
  s3ApiUrl = environment.s3Api;

  searchFormGroup = this._formBuilder.group({
    searchCtrl : new FormControl('')
  })
  totalCount: any;
  private unsubscribe = new Subject<void>();

  constructor(public router:Router,
    private cd:  ChangeDetectorRef,
    private kitchenService : KitchenService,
     private messageService: MessageService,  
    private _formBuilder : FormBuilder,
    private authService: SocialAuthService,
    private orderService: OrderService,
    public offcanvasService: NgbOffcanvas){
    console.log(this.router.url,">>>>router");
    this.navLinks = []
    this.messageService
		.getMessage()
		.pipe(takeUntil(this.unsubscribe))
		.subscribe((data) => {
		  console.log(data,">>>>")
		  if(data && data.refresh == true) {
			this.ngOnInit();
		  }
      let temp = localStorage.getItem("loggedIn");
      this.loggedIn = temp ? true: false;
      this.ngOnInit();
		});
    this.authService.authState.subscribe((user) => {
      this.user = user;
      // this.loggedIn = (user != null);
      console.log(user,">>>USER")
      let userObj = {
        email: user.email,
        password: user.idToken,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.email
      }
      this.orderService.createCustomer(userObj).subscribe({
        next: (result) => {
          console.log(result, ">>  RESULT");
          let response = result.response;
          if(response.isExist) {
            localStorage.setItem("loggedIn", "true")
            localStorage.setItem("currentUser", JSON.stringify(response.data));
            // this.toastr.error('Error!', 'Phone Number Already Exists');
          }else{
            localStorage.setItem("loggedIn", "true")
            localStorage.setItem("currentUser", JSON.stringify(response));

          }
          this.ngOnInit();
          // let obj = {
          //   refresh:true
          // }
          // this.messageService.sendMessage(obj);
          // this.toastr.error('Error!', 'Invalid FSSAI');

        },
        error: (e) => console.error(e),
        complete: () => console.info('complete')
      });
    });
  }
  ngOnInit() {

    if(!this.loggedIn){
      let temp = localStorage.getItem("loggedIn");
      this.loggedIn = temp ? true: false;
    }
    let tempVal = localStorage.getItem("currentUser");
    this.currentUser = tempVal ? JSON.parse(tempVal) : {};

    console.log(this.router.url,">>>>router");
    this.router.events.subscribe((res) => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
    });
    let cartDetail = localStorage.getItem("cartData");
    this.cartData = cartDetail ? JSON.parse(cartDetail) :[];
    this.getCategory()
    this.calculateQty();
    this.kitchenService.getSearchData({searchVal: "a"}).then(result => {
      console.log(result,">>>>>result")
      this.searchResult = result.result;
      // debugger;
      this.filteredSearch = this.searchFormGroup.controls["searchCtrl"].valueChanges.pipe(
        debounceTime(1500),
        startWith(''),
        map(state => 
          (state ? this._filterStates(state) : this.searchResult.slice())
        ),
      );
    });
  }

  calculateQty() {
    let qty = _.map(this.cartData, "quantity");
    this.totalCount =  qty.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    this.cd.detectChanges();
    console.log(this.totalCount,">>>>TOTAL")
  }
  onActive(route:string) {
    this.router.navigate([route])
  }

  changeOfRoutes() {
    if(this.router.url == '/order'){
      this.enableMenu = false;
    }else{
      this.enableMenu = true;
    }
  }
  open() {
    const offcanvasRef = this.offcanvasService.open(CartSummaryComponent,{position: 'end'});
		// this.offcanvasService.open(content, { ariaLabelledBy: 'offcanvas-basic-title',position: 'end' }).result.then(
		// 	(result) => {
		// 		this.closeResult = `Closed with: ${result}`;
		// 	},
		// 	(reason) => {
		// 		this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		// 	},
		// );
	}
  logout(){
    localStorage.clear();
    let obj = {
      refresh:true
    }
    this.messageService.sendMessage(obj);
    this.router.navigate(['']);
  }

  selectedOption(option:any) {
    console.log(option);

    // this.enableKitchenView = false;
    // this.enableProductView = false;
    // setTimeout(()=>{
      localStorage.setItem("searchSelection", JSON.stringify(option));
      localStorage.setItem("fromSearch", "true");
      if(option.productName){
        let category = option.category;
        let categoryName = category.categoryName.toLowerCase();
        this.router.navigate([categoryName]);
        // this.enableKitchenView = false;
        // this.enableProductView = true;
      }else{
        localStorage.setItem("selectedKitchen", JSON.stringify(option));
        this.router.navigate(['products']);
        // this.enableKitchenView = true;  
        // this.enableProductView = false;
      }
    // },100)

  }

  redirect() {
    localStorage.removeItem("fromSearch");
  }

  private _filterStates(value: string): any {
    const filterValue = value.toLowerCase();
    // setTimeout(()=>{
    this.kitchenService.getSearchData({searchVal: filterValue}).then(result => {
      console.log(result,">>>>>result")
      this.searchResult = result.result;
      this.filteredSearch = this.searchFormGroup.controls["searchCtrl"].valueChanges.pipe(
        debounceTime(1500),
        startWith(''),
        map(state => 
          (state ? this._filterStates(state) : this.searchResult.slice())
        ),
      );
      return this.searchResult;
    });
    // }, 3000)

  }
  
  getCategory(){
    this.kitchenService.getCategories().subscribe({
      next: (result) => {
        console.log(result, ">>  RESULT");
        let response = result.data;
        this.navLinks = response.map((item:any, index: any) => ({
          label: item.categoryName,
          // link: `/${item.categoryName.toLowerCase()}`,
          link: `/${item.categoryName.toLowerCase().replace(/\s+/g, '_')}`,
          index: index + 1 // Start from 1 (or use index directly if 0-based)
        }));
        
        // Optionally add "Home" at the beginning
        this.navLinks.unshift({
          label: 'Home',
          link: './' ,
          index: 0
        });

        this.messageService.sendMessageCategory({isCateory: true, navLinks: this.navLinks});
      },
      error: (e) => console.error(e),
      complete: () => console.info('complete')
    });
  }
}
