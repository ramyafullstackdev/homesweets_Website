import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OrderService } from 'src/app/order/order.service';
import * as _ from "lodash";
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  providers: [OrderService]

})
export class AddressComponent {
  addresses: any = [];
  countries: any = [];
  states: any = [];
  cities: any = [];
  selectedStateCode: any;
  incorrectPin: Boolean = true;
  filteredCities: any = [];
  currentAddress: any = {};
  editMode: boolean = false;
  editId: string | null = null;

addressForm = this._formBuilder.group({
  firstName:['', [Validators.required, Validators.minLength(2)]],
  lastName:['', [Validators.required, Validators.minLength(2)]],
  address1:['', [Validators.required, Validators.minLength(5)]],
  address2:['', [Validators.required]],
  landmark:[''],
  state:['', [Validators.required]],
  country:['', [Validators.required]],
  pincode:['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
  city:['', [Validators.required]],
  phone:['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
});
  currentUser: any = {};
  constructor(private _formBuilder: FormBuilder, private orderService: OrderService,
    private cd: ChangeDetectorRef) { 
      this.filteredCities = this.addressForm.controls.city.valueChanges.pipe(
        startWith(''),
        map(city => (city ? this._filterCities(city) : this.cities.slice())),
      );
    }



  ngOnInit() {
    let tempVal = localStorage.getItem("currentUser");
    this.currentUser = tempVal ? JSON.parse(tempVal) : {};
    this.orderService.getAddress({userName: this.currentUser.userName}).then(addresses => {
      console.log(addresses,">>>>addresses")
      this.addresses = (addresses.response) ? addresses.response : [];
      this.addresses.push(
        {
          "name": "Add New Address",
          "address1": "name of street and house/building name",
          "address2": "area name",
          "landmark": "nearest landmark",
          "city": "city name",
          "pincode": "pincode",
          "state": "State",
          "country": "Country",
          "phone" :"Phone Number"
        }
      )
      console.log(this.addresses);
    });
    this.orderService.getAllCities().subscribe({
      next: (result) => {
          this.cities = result.response;
          this.filteredCities = this.addressForm.controls.city.valueChanges.pipe(
            startWith(''),
            map(city => (city ? this._filterCities(city) : this.cities.slice())),
          );
          console.log(this.filteredCities,">>>filteredCities")
      },
      error: (e) => console.error(e),
      complete: () => console.info('complete')
    });
    //     const mapProperties = {
    //       center: new google.maps.LatLng(35.2271, -80.8431),
    //       zoom: 15,
    //       mapTypeId: google.maps.MapTypeId.ROADMAP
    //  };
    //  this.map = new google.maps.Map(this.mapElement.nativeElement,    mapProperties);
  }
  getCountries() {
    this.orderService.getCountry().then(result => {
      this.countries.push(result["response"]);
      console.log(this.countries, ">>this.countries")
      this.getStates();
    })
  }

editAddress(address: any) {
  this.editMode = true;
  this.editId = address._id;
  let addr = {...address};
  delete addr._id;
  this.addressForm.setValue(addr);
}


  deleteAddress(){
    console.log(this.currentAddress,">>>CURENT")
    this.orderService.deleteAddress(this.currentAddress._id).then(resp => {
      this.ngOnInit();
    });
  }


  addNew() {
    this.addressForm.reset();
    this.resetEditState();
  }


  private _filterCities(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.cities.filter((city: any) => city.name.toLowerCase().includes(filterValue));
  }

  getStates() {
    this.orderService.getStates().then(result => {
      this.states = result["response"];
      console.log(this.states, ">>this.states")

    })
  }

  getCities(event: any) {
  console.log(event.target.value, ">>value");
  this.orderService.getCities(event.target.value).then(result => {
    console.log(result, ">>>CITY");
    this.cities = result["response"];

    this.filteredCities = this.addressForm.controls.city.valueChanges.pipe(
      startWith(''),
      map(city => (city ? this._filterCities(city) : this.cities.slice()))
    );
  });
}


verifyPin() {
  console.log(this.addressForm.value.city, ">>>> city");
  console.log(this.addressForm.value.pincode, ">>>> pin");
  this.orderService.verifyCityPincode(this.addressForm.value.city).then(result => {
    console.log(result, ">>>CITY");
    if (Array.isArray(result) && result.length > 0 && result[0].PostOffice) {
      let pincodes = _.map(result[0].PostOffice, "Pincode");
      console.log('paru pincodes', pincodes);
      this.incorrectPin = pincodes.includes(this.addressForm.value.pincode);
    } else {
      this.incorrectPin = false;
    }
    console.log(this.incorrectPin, ">>incorrect");
  });
}


saveAddress() {
  if (this.addressForm.invalid) {
    this.addressForm.markAllAsTouched();
    return;
  }

  const formData = this.addressForm.value;
  const userName = this.currentUser?.userName;

  if (this.editMode && this.editId) {
    this.orderService.updateAddress(formData, this.editId).subscribe({
      next: (res) => {
        console.log("Address updated:", res);
        this.ngOnInit();
        (document.getElementById('exampleModalCenter') as any)?.click();
        this.resetEditState();
      },
      error: (err) => console.error("Error updating address", err)
    });
  } else {
    this.orderService.createAddress(formData, userName).subscribe({
      next: (res) => {
        console.log("Address created:", res);
        this.ngOnInit();
        (document.getElementById('exampleModalCenter') as any)?.click();
        this.resetEditState();
      },
      error: (err) => console.error("Error creating address", err)
    });
  }
}

resetEditState() {
  this.editMode = false;
  this.editId = null;
  this.addressForm.reset();
}

}
