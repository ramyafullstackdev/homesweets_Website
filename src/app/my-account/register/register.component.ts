import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'src/app/services/message.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from 'src/app/order/order.service';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, startWith } from 'rxjs';
import { CountryCode } from 'src/app/scrolling-banner/interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [OrderService]
})
export class RegisterComponent {
  registerFormGroup = this._formBuilder.group({
    inputformControl: [''],  
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    // socialTitle: ['', Validators.required],

    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    // password: ['', Validators.required],
    otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
countryCode: [null as CountryCode | null, [Validators.required, this.validateCountrySelection.bind(this)]],
  });

  currentOTP : any = "";
  validNumber: Boolean = true;
  validOTP : Boolean = true;
  hide = true;
  viewPassword: Boolean = false;
  existingPhone : Boolean = false;
  showField: Boolean = false;
  countryCodes: any[] = [];
  filteredCountryCodes!: Observable<any[]>;
  constructor(private _formBuilder: FormBuilder,
    private orderService: OrderService,
    private toastr : ToastrService,
     private messageService: MessageService) {
      this.getCountry()

      this.filteredCountryCodes = this.registerFormGroup.controls['countryCode'].valueChanges.pipe(
        startWith(''),
        map((value: any) => typeof value === 'string' ? value : value?.name),
        map(name => name ? this._filter(name) : this.countryCodes.slice())
      );
  }

    ngOnInit() {

    this.getCountry()

    this.filteredCountryCodes = this.registerFormGroup.controls['countryCode'].valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map(name => name ? this._filter(name) : this.countryCodes.slice())
    );

    this.registerFormGroup.get('countryCode')?.valueChanges.subscribe((selected: any) => {
      if (selected && selected.phone_min_length && selected.phone_max_length) {
        this.setPhoneValidators(selected.phone_min_length, selected.phone_max_length);
      } else {
        this.setPhoneValidators(10, 10);
      }
      this.registerFormGroup.get('phoneNumber')?.setValue('');
    });

    this.registerFormGroup.get('otp')?.clearValidators();
    this.registerFormGroup.get('otp')?.updateValueAndValidity();
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
      key:"Login"
    }
    this.messageService.sendMessage(obj);
  }

  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.registerFormGroup.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerFormGroup.get(fieldName);
    if (!field || !field.errors || (!field.dirty && !field.touched)) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field.hasError('minlength')) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    if (field.hasError('pattern')) {
      if (fieldName === 'phoneNumber') {
        return 'Phone number must be exactly 10 digits';
      }
      if (fieldName === 'otp') {
        return 'OTP must be exactly 6 digits';
      }
    }
    return 'Invalid value';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'email': 'Email',
      'phoneNumber': 'Phone Number',
      'otp': 'OTP',
      'countryCode': 'Country Code'
    };
    return labels[fieldName] || fieldName;
  }

  getOTP(data: any) {
    this.registerFormGroup.controls.phoneNumber.markAsTouched();
    this.registerFormGroup.controls.countryCode.markAsTouched();

    if (this.registerFormGroup.controls.phoneNumber.invalid || 
        this.registerFormGroup.controls.countryCode.invalid) {
      this.toastr.warning('Warning!', 'Please enter valid phone number and country code');
      return;
    }

    let phoneNumber = (data.countryCode ? data.countryCode.dial_code : "+91") + data.phoneNumber;

    this.orderService.getOTP(phoneNumber).then(otpVALUE => {
      this.currentOTP = otpVALUE.OTP ? otpVALUE.OTP : "";
      this.validNumber =  otpVALUE.OTP ?  true: false;
      
      if (this.validNumber) {
        this.validOTP = false;
        this.showField = true;
        this.toastr.success('Success!', 'OTP sent successfully');
      } else {
        this.toastr.error('Error!', 'Invalid phone number');
      }
    }).catch(error => {
      this.toastr.error('Error!', 'Failed to send OTP');
      console.error(error);
    });
  }

  checkOTP(value:any) {
    this.validOTP = (value == this.currentOTP);
    if (!this.validOTP && value) {
      this.toastr.error('Error!', 'Invalid OTP');
    }
  }

  submit(){
    Object.keys(this.registerFormGroup.controls).forEach(key => {
      this.registerFormGroup.get(key)?.markAsTouched();
    });

    if(this.showField) {
      this.checkOTP(this.registerFormGroup.controls.otp.value);
        // if(this.validOTP && this.validNumber && this.registerFormGroup.valid){
      if (this.validOTP && this.validNumber && this.registerFormGroup.valid) {
        this.orderService.createCustomer(this.registerFormGroup.value).subscribe({
          next: (result) => {
            let response = result.response;
            if(response.isExist) {
              this.existingPhone = true;
              this.toastr.error('Error!', 'Phone Number Already Exists');
            }else{
              let obj = {
                key:"Login"
              }
              this.messageService.sendMessage(obj);
              this.toastr.success('Success!', 'User registered successfully');
            }
          },
          error: (e) => {
            console.error(e);
            this.toastr.error('Error!', 'Registration failed. Please try again.');
          },
          complete: () => console.info('complete')
        });
      } else {
        if (!this.validOTP) {
          this.toastr.error('Error!', 'Please enter valid OTP');
        } else {
          this.toastr.warning('Warning!', 'Please fill all required fields correctly');
        }
      }
    } else {
      this.getOTP(this.registerFormGroup.getRawValue());
    }
  }

  
  getCountry(){
    this.orderService.getCountryCode().then(countryCodes => {
         this.countryCodes = countryCodes.response
    }).catch(err => {
      console.error(err)
    })
  }
    validateCountrySelection(control: any) {
  const value = control.value;
  if (!value) return { required: true }; 
  if (typeof value === 'string') {
    return { invalidSelection: true };
  }
  return null;
}

  setPhoneValidators(min: number, max: number) {
    const phoneControl = this.registerFormGroup.get('phoneNumber');
    phoneControl?.setValidators([
      Validators.required,
      Validators.minLength(min),
      Validators.maxLength(max),
      Validators.pattern(/^[0-9]*$/)
    ]);
    phoneControl?.updateValueAndValidity();
  }

}
