import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'src/app/services';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { SocialUser } from "@abacritt/angularx-social-login";
import { OrderService } from 'src/app/order/order.service';
import { map, Observable, startWith } from 'rxjs';
import { CountryCode } from 'src/app/scrolling-banner/interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [OrderService]
})
export class LoginComponent {
  loginFormGroup = this._formBuilder.group({
countryCode: [null as CountryCode | null, [Validators.required, this.validateCountrySelection.bind(this)]],

  phoneNumber: ['', [
    Validators.required,
    Validators.pattern(/^[0-9]*$/)
  ]],
  otp: ['', []]
});


  user!: SocialUser | null;
  loggedIn!: boolean;
  hide = true;
  invalidUser: Boolean = false;
  viewPassword: Boolean = false;
  showField: Boolean = false;
  currentOTP : any = "";
  validNumber: Boolean = true;
  validOTP : Boolean = true;
  countryCodes: any[] = [];
  filteredCountryCodes!: Observable<any[]>;

  constructor(private _formBuilder: FormBuilder, 
    private messageService: MessageService,
    private orderService: OrderService,
    private authService: SocialAuthService) {
    // this.user = null;
    // this.authService.authState.subscribe((user: SocialUser) => {
    //   console.log(user,">>>USER");
    //   console.log(GoogleLoginProvider,">>>GoogleLoginProvider")
    //   this.user = user;
    // });
  }
  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
    this.getCountry()

    this.filteredCountryCodes = this.loginFormGroup.controls['countryCode'].valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map(name => name ? this._filter(name) : this.countryCodes.slice())
    );

    this.loginFormGroup.get('countryCode')?.valueChanges.subscribe((selected: any) => {
      if (selected && selected.phone_min_length && selected.phone_max_length) {
        this.setPhoneValidators(selected.phone_min_length, selected.phone_max_length);
      } else {
        this.setPhoneValidators(10, 10);
      }
      this.loginFormGroup.get('phoneNumber')?.setValue('');
    });

    this.loginFormGroup.get('otp')?.clearValidators();
    this.loginFormGroup.get('otp')?.updateValueAndValidity();
  }

  setPhoneValidators(min: number, max: number) {
    const phoneControl = this.loginFormGroup.get('phoneNumber');
    phoneControl?.setValidators([
      Validators.required,
      Validators.minLength(min),
      Validators.maxLength(max),
      Validators.pattern(/^[0-9]*$/)
    ]);
    phoneControl?.updateValueAndValidity();
  }

  private _filter(name: string): any[] {
  const filterValue = name.toLowerCase();
  return this.countryCodes.filter(option =>
    option.name.toLowerCase().includes(filterValue) ||
    option.dial_code.includes(filterValue)
  );
}

displayCode(code: any): string {
  return code ? code.dial_code : '';
}

  redirect() {
    let obj = {
      key:"Register"
    }
    this.messageService.sendMessage(obj);
  }
  loginGoogle() {

  }
  getOTP(data: any) {
    let phoneNumber = (data.countryCode ? data.countryCode.dial_code : "+91") + data.phoneNumber;
    this.orderService.getOTP(phoneNumber).then(otpVALUE => {
      if (otpVALUE?.OTP) {
      this.showField = true;
      this.validNumber = true;
      this.currentOTP = otpVALUE.OTP;
      this.validOTP = true;

      this.loginFormGroup.get('otp')?.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern(/^[0-9]{6}$/)
      ]);
      this.loginFormGroup.get('otp')?.updateValueAndValidity();
    } else {
      this.showField = false;
      this.validNumber = false; 
      this.currentOTP = "";
      this.loginFormGroup.get('otp')?.clearValidators();
      this.loginFormGroup.get('otp')?.updateValueAndValidity();
    }
    }).catch(error => {
      this.validNumber = false;
      this.showField = false;
    });
  }

  checkOTP(value:any) {
    this.validOTP = (value == this.currentOTP) ? true: false;
  }

  isSubmitDisabled(): boolean {
    if (!this.showField) {
      const country = this.loginFormGroup.controls.countryCode.value;
      return !country ||
             this.loginFormGroup.controls.phoneNumber.invalid ||
             this.loginFormGroup.controls.countryCode.invalid;
    } else {
      return this.loginFormGroup.invalid || !this.validOTP;
    }
  }

  submit() {
    Object.keys(this.loginFormGroup.controls).forEach(key => {
      this.loginFormGroup.get(key)?.markAsTouched();
    });

    if (!this.showField) {
      if (this.loginFormGroup.controls.phoneNumber.invalid ||
        this.loginFormGroup.controls.countryCode.invalid) {
        return;
      }

      this.orderService.customerValidation(this.loginFormGroup.value).subscribe({
        next: (result) => {
          let response = result.response;
          if (response && response.length > 0) {
            this.invalidUser = false;
            this.getOTP(this.loginFormGroup.getRawValue());
          }else{
            this.invalidUser = true;
          }

        },
        error: () => {
          this.invalidUser = true;
        }
      });
    } else {
      this.checkOTP(this.loginFormGroup.controls.otp.value);

      if (this.loginFormGroup.valid && this.validOTP) {
        this.orderService.customerLogin(this.loginFormGroup.value).subscribe({
          next: (result) => {
            let response = result.response;
            if (response && response.length > 0) {
              this.invalidUser = false;
              localStorage.setItem("loggedIn", "true");
              localStorage.setItem("currentUser", JSON.stringify(response[0]));
              this.messageService.sendMessage({ key: "Account" });
            } else {
              this.invalidUser = true;
            }
          },
          error: () => {
            this.invalidUser = true;
          }
        });
      }
    }
  }

  getCountry() {
    this.orderService.getCountryCode().then(countryCodes => {
      this.countryCodes = countryCodes.response || [];
      const defaultCountry = this.countryCodes.find(c => c.dial_code === '+91');
      if (defaultCountry) {
        this.loginFormGroup.patchValue({ countryCode: defaultCountry });
      }
    }).catch(() => {});
  }

  validateCountrySelection(control: any) {
  const value = control.value;
  if (!value) return { required: true };
  if (typeof value === 'string') {
    return { invalidSelection: true };
  }
  return null;
}


  onOtpChange() {
    this.validOTP = true;
  }
}

