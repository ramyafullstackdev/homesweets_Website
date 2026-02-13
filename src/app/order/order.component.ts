import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';

import { MaterialModule } from '../material.module';
import { OrderService } from './order.service';
import * as _ from "lodash";
import { MatStepper } from '@angular/material/stepper';
import {map, startWith} from 'rxjs/operators';
import { MessageService } from '../services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

// import {} from 'googlemaps';
declare var Razorpay: any;

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  providers: [OrderService]

})
export class OrderComponent {
  addressForm = this._formBuilder.group({
    firstName:['', Validators.required],
    lastName:['', Validators.required],
    address1:['', Validators.required],
    address2:['', Validators.required],
    landmark:[''],
    state:['', Validators.required],
    country:['', Validators.required],
    pincode: ['', Validators.required],
    city:['', Validators.required],
    phone:['', Validators.required]
  });
  loginForm = this._formBuilder.group({
    phoneNumber: ['', Validators.required],
    otp: ['', Validators.required]
  });
  registerForm = this._formBuilder.group({
    firstName:['', Validators.required],
    lastName:['', Validators.required],
    email: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    otp: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    addressVal: ['', Validators.required],
  });
  // @ViewChild('map') mapElement: any;
  // map: google.maps.Map | undefined;
  incorrectPin : Boolean = true;
  showButtons: Boolean = true;
  enableLogin: Boolean = false;
  enableSignup:Boolean = false;
  successPayment: Boolean = false;
  addresses: any = [];
  countries : any = [];
  states : any = [];
  cities : any = [];
  selectedStateCode :any ;
  filteredCities: any = [];
  totalCartValue : any = 0;
  totalItems: any = 0;
  RazorpayOptions:any = {}
  cartData: any = [];
  hide = true;
  loggedIn :Boolean = false;
  currentUser : any = {};
  invalidUser: Boolean= false;
  existingPhone : Boolean = false;
  showOtpField : Boolean = false;
  currentOTP : any = "";
  validNumber: Boolean = true;
  validOTP : Boolean = true;
  selectedAddress: any = {};
  constructor(private _formBuilder: FormBuilder, 
    private messageService: MessageService,
    private orderService: OrderService,
    private router: Router,
    private cd:  ChangeDetectorRef,
    private toastr : ToastrService) {
      this.filteredCities = this.addressForm.controls.city.valueChanges.pipe(
        startWith(''),
        map(city => (city ? this._filterCities(city) : this.cities.slice())),
      );
  }

  ngOnInit() {
    let cartDetails = localStorage.getItem("cartData");
    this.cartData = cartDetails ? JSON.parse(cartDetails) : [];
    let temp = localStorage.getItem("loggedIn");
    this.loggedIn = temp ? true: false;
    let tempVal =  localStorage.getItem("currentUser");
    this.currentUser = tempVal ? JSON.parse( tempVal):{}
    if(this.currentUser.userName) {
      this.loginForm.controls["phoneNumber"].setValue(this.currentUser.userName);
    }
    this.calculateMainTotal();

    this.orderService.getAllCities().subscribe({
      next: (result) => {
          this.cities = result.response;
          this.filteredCities = this.addressForm.controls.city.valueChanges.pipe(
            startWith(''),
            map(city => (city ? this._filterCities(city) : this.cities.slice())),
          );
      },
      error: (e) => console.error(e),
      complete: () => console.info('complete')
    });
    this.getAddress();
//     const mapProperties = {
//       center: new google.maps.LatLng(35.2271, -80.8431),
//       zoom: 15,
//       mapTypeId: google.maps.MapTypeId.ROADMAP
//  };
//  this.map = new google.maps.Map(this.mapElement.nativeElement,    mapProperties);
  }

  getAddress() {
    let queryVal = {
      userName: null
    };
    this.addresses = [];
    if(this.currentUser && this.currentUser.userName){
      queryVal["userName"] = this.currentUser.userName;
      this.orderService.getAddress(queryVal).then(addresses => {
        this.addresses = (addresses.response) ? addresses.response : [];
        this.addresses.push(
          {
            "firstName":"Add New Address",
            "lastName":"",
            "address1":"name of street and house/building name",
            "address2":"area name",
            "landmark":"nearest landmark",
            "phone" :"",
            "city" : "city name",
            "pincode":"pincode",
            "state":"State",
            "country":"Country"
          }
        )
        
      });
    }else{
      this.addresses.push(
        {
          "firstName":"Add New Address",
          "lastName":"",
          "address1":"name of street and house/building name",
          "address2":"area name",
          "landmark":"nearest landmark",
          "phone" :"",
          "city" : "city name",
          "pincode":"pincode",
          "state":"State",
          "country":"Country"
        }
      )
    }
  

  }

  calculateMainTotal (){
    this.totalCartValue = 0;
    this.totalItems = 0;
    _.forEach(this.cartData , (cart)=>{
      cart.totalVal = Math.round(cart.quantity * cart.productCurrentPrice);
      this.totalItems = this.totalItems + parseInt(cart.quantity);
      this.totalCartValue = this.totalCartValue + cart.totalVal;
    })
  }

  stepperNext(stepper: any) {
    stepper.next()
  }

  getCountries() {
    this.orderService.getCountry().then(result => {
      this.countries.push(result["response"]);
      this.getStates();
    })
  }

  getStates() {
    this.orderService.getStates().then(result => {
        this.states = result["response"];

    })
  }

  getCities (event: any) {
    this.orderService.getCities(event.target.value).then(result => {
      this.cities = result["response"];
      this.filteredCities = this.addressForm.controls.city.valueChanges.pipe(
        startWith(''),
        map(city => (city ? this._filterCities(city) : this.cities.slice())),
      );
    })
  }

  verifyPin () {
    this.orderService.verifyCityPincode(this.addressForm.value.city).then(result => {
      if (result && result[0] && result[0].PostOffice) {
        let pincodes = _.map(result[0].PostOffice, "Pincode");
        this.incorrectPin = pincodes.includes(this.addressForm.value.pincode);
      } else {
        this.incorrectPin = false;
      }
    }).catch(() => {
      this.incorrectPin = false;
    })
  }

  goForward(stepper: MatStepper, address:any){
    this.selectedAddress = address;
    this.secondFormGroup.setValue({"addressVal":"1"})
    stepper.next();
  }

  submit(){
    // this.addresses.push(this.addressForm.value);
    this.orderService.createAddress(this.addressForm.value, this.currentUser.userName).subscribe({
      next: (result) => {
        this.getAddress();
      },error: (e) => console.error(e),
      complete: () => console.info('complete')
    });
  }

  getOTP(phoneNumber: any) {
    this.orderService.getOTP(phoneNumber).then(otpVALUE => {
      this.showOtpField = true;
      this.currentOTP = otpVALUE.OTP ? otpVALUE.OTP : "";
      this.validNumber =  otpVALUE.OTP ?  true: false;
      this.validOTP = false;
    });
  }

  update() {
    this.invalidUser = false;
  }

  checkOTP(value:any) {
    this.validOTP = (String(value) === String(this.currentOTP)) ? true: false;
  }

  login(stepper:any) {
    if(this.showOtpField) {
      this.checkOTP(this.loginForm.controls.otp.value);
      // if(this.loginForm.valid && this.validOTP){
      if(this.loginForm.valid){
        this.orderService.customerLogin(this.loginForm.value).subscribe({
          next: (result) => {
            let response = result.response;
            if(response && response.length > 0) {
              this.invalidUser = false;
              this.currentUser = response[0];
              localStorage.setItem("loggedIn", "true");
              localStorage.setItem("currentUser", JSON.stringify(response[0]));
              this.getAddress();
              stepper.next();
            }else{
              this.invalidUser = true;
            }
  
          },
          error: (e) => console.error(e),
          complete: () => console.info('complete')
        });
      }else{
        
      }
    }else{
      this.orderService.customerValidation(this.loginForm.value).subscribe({
        next: (result) => {
          let response = result.response;
          if(response && response.length > 0) {
             this.getOTP(this.loginForm.controls.phoneNumber.value);
          }else{
            this.invalidUser = true;
          }

        },
        error: (e) => console.error(e),
        complete: () => console.info('complete')
      });
    }
  }

  register(stepper:any) {
    if(this.showOtpField) {
      this.checkOTP(this.registerForm.controls.otp.value);
    // if(this.registerForm.valid && this.validOTP){
      if(this.registerForm.valid){
        this.orderService.createCustomer(this.registerForm.value).subscribe({
          next: (result) => {
            let response = result.response;
            if(response.isExist) {
              this.existingPhone = true;
              // this.toastr.error('Error!', 'Phone Number Already Exists');
            }else{
              localStorage.setItem("loggedIn", "true");
              localStorage.setItem("currentUser", JSON.stringify(response));
              stepper.next();
            }
            // this.toastr.error('Error!', 'Invalid FSSAI');
  
          },
          error: (e) => console.error(e),
          complete: () => console.info('complete')
        });
      }else{
        
      }
    }else{
      this.getOTP(this.loginForm.controls.phoneNumber.value);
    }

  }
  logout(){
    localStorage.clear();
    let obj = {
      refresh:true
    }
    this.messageService.sendMessage(obj);
    this.router.navigate(['']);
  }

  payNow() {
    this.RazorpayOptions = {
      description: 'HomeSweets Razorpay',
      currency: 'INR',
      amount: this.totalCartValue+"00",
      name: 'Home Sweets',
      key: environment.razorpayKey,
      image: 'https://images.freeimages.com/images/large-previews/3ff/chain-link-fence-1187948.jpg',
      prefill: {
        name: this.currentUser.displayName,
        email: this.currentUser.email,
        phone: this.currentUser.userName
      },
      // handler: function (response:any){
      //   console.log(response,">>>response")
      //   if(response.razorpay_payment_id) {
          
      //   }
      // },
      theme: {
        color: '#C6A756'
      },
      modal: {
        ondismiss:  () => {
        }
      }
    }
    this.RazorpayOptions['handler'] = this.razorPaySuccessHandler.bind(this);

    const successCallback = (paymentid: any) => {
    }

    const failureCallback = (e: any) => {
    }

    Razorpay.open(this.RazorpayOptions)
  }

  public razorPaySuccessHandler(response:any) {
    // alert("dfv")
    if(response && response.razorpay_payment_id == undefined){
      this.successPayment = false;
    }else{ 
      this.successPayment = true;
      let formData = {
        paymentId: response.razorpay_payment_id,
        cartData: this.cartData,
        totalItems: this.totalItems,
        totalPrice: this.totalCartValue,
        shipTo: this.selectedAddress.firstName,
        address: this.selectedAddress,
        paymentMethod: "Online",
        shipping: 0,
        grandTotal: this.totalCartValue ,
        userId: this.currentUser._id
      }
      this.orderService.placeOrder(formData, this.currentUser.userName).subscribe({
        next: (result) => {

          //need to create payment history
          const paymentHistroyReqData = {
            ...result.response,
            paymentId: formData.paymentId,
            paymentStatus: 'Success'
          }
          this.toastr.success('Sucess!', 'Order created sucessflly');

          this.createPaymentHistory(paymentHistroyReqData);

        },error: (e) => {
          console.error(e)
          this.toastr.error('Error!', 'Unable to Order');
        },
        complete: () => console.info('complete')
      });
      localStorage.removeItem('cartData');
      localStorage.removeItem('cartProduct');
      this.messageService.sendMessage({refresh:true});
    }
    this.cd.detectChanges()
  }

  createPaymentHistory(orderDetails: any) {
    this.orderService.createPaymentHistory(orderDetails).subscribe({
      next: (result) => {

      }, error: (e) => console.error(e),
      complete: () => console.info('complete')
    });
  }

  private _filterCities(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.cities.filter((city: any) => city.name.toLowerCase().includes(filterValue));
  }
}
