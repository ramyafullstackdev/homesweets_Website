import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../services';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderComponent, NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from 'src/environments/environment';
import { MainService } from '../main/main.service';
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
  selector: 'app-favorite-login',
  templateUrl: './favorite-login.component.html',
  styleUrls: ['./favorite-login.component.scss'],
  providers: [MainService, OrderService]
})

export class FavoriteLoginComponent {

  inputdata: any;
  closemessage = 'closed using directive';
  favoriteFrom: FormGroup;
  rating: any
  get favoriteFromAbsCtrl(): { [key: string]: AbstractControl } {
    return this.favoriteFrom.controls;
  }
  file!: File
  fileName: String = "";
  filteredCountryCodes!: Observable<any[]>;
  countryCodes: any[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private ref: MatDialogRef<FavoriteLoginComponent>, private fb: FormBuilder,
private mainService: MainService, private messageService: MessageService, private orderService: OrderService) {
      this.favoriteFrom = this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        phoneNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
        countryCode: [null as CountryCode | null, Validators.required],
        email: ['', [
          Validators.required,
          Validators.email,
        ]],
        _id: ['']
      });

  }
  ngOnInit(): void {
    console.log(this.data)
    this.inputdata = this.data;
    console.log(this.inputdata.data)
    this.getCountry()
    this.filteredCountryCodes = this.favoriteFrom.controls['countryCode'].valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map(name => name ? this._filter(name) : this.countryCodes.slice())
    );
  }

  closepopup(data?: any) {
    this.ref.close(data);
  }

  submit() {
    console.log(this.favoriteFrom)
    if (this.favoriteFrom.valid) {
      let data = this.favoriteFrom.getRawValue();
      console.log(data,"data")
      this.create(data)
    }
  }

  create(data: any){
    this.mainService.createLoginFavorite(data).subscribe({
      next: (result) => {
        console.log(result, ">>  RESULT");
        let response = result.response;
        if(result.meta.status === 200) {
          
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("currentUser", JSON.stringify(response));
            let obj = {
              key:"Account"
            }
            this.messageService.sendMessage(obj);
          }
          this.closepopup(response);

      },
      error: (e) => {
        console.error(e)
      },
      complete: () => console.info('complete')
    });
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
        this.favoriteFrom.patchValue({ countryCode: defaultCountry });
      }
    }).catch(() => {});
  }
  
  displayCode(code: any): string {
    return code ? `${code.name} (${code.dial_code})` : '';
  }
}
