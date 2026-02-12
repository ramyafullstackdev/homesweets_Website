import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/order/order.service';
import { Observable, map, startWith } from 'rxjs';
import { CountryCode } from 'src/app/scrolling-banner/interface';

@Component({
  selector: "app-information",
  templateUrl: "./information.component.html",
  styleUrls: ["./information.component.scss"],
})
export class InformationComponent {
  informationForm = this._formBuilder.group({
    email: ["", [Validators.required, Validators.email]],
    name: ["", [Validators.required, Validators.minLength(3)]],
    phoneNumber: [{ value: "", disabled: true }],
    altCountryCode: [
      null as CountryCode | null,
      [Validators.required, this.validateCountrySelection.bind(this)],
    ],
    altPhoneNumber: ["", [Validators.required, Validators.pattern(/^[0-9]+$/)]],
  });

  currentUser: any = {};
  isEdited: boolean = true;
  countryCodes: any[] = [];
  filteredCountryCodes!: Observable<any[]>;

  constructor(
    private _formBuilder: FormBuilder,
    private orderService: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    let tempVal = localStorage.getItem("currentUser");
    this.currentUser = tempVal ? JSON.parse(tempVal) : {};
    this.informationForm.patchValue({
      email: this.currentUser.email,
      name: this.currentUser.displayName,
      phoneNumber: this.currentUser.userName,
      altPhoneNumber: this.currentUser.altPhoneNumber,
    });

    this.informationForm.valueChanges.subscribe(() => {
      this.isEdited = false;
    });

    this.getCountry();

    this.filteredCountryCodes = this.informationForm.controls[
      "altCountryCode"
    ].valueChanges.pipe(
      startWith(""),
      map((value: any) =>
        typeof value === "string" ? value : value?.name || ""
      ),
      map((name) => (name ? this._filter(name) : this.countryCodes.slice()))
    );
    let initialized = false;
    this.informationForm
      .get("altCountryCode")
      ?.valueChanges.subscribe((selected: any) => {
        if (
          selected &&
          selected.phone_min_length &&
          selected.phone_max_length
        ) {
          this.setPhoneValidators(
            selected.phone_min_length,
            selected.phone_max_length
          );
        } else {
          this.setPhoneValidators(10, 10);
        }
        if (!initialized) {
          initialized = true;
          return;
        }
        this.informationForm.get("altPhoneNumber")?.setValue("");
      });

    this.informationForm.get("otp")?.clearValidators();
    this.informationForm.get("otp")?.updateValueAndValidity();
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.countryCodes.filter(
      (option) =>
        option.name.toLowerCase().includes(filterValue) ||
        option.dial_code.includes(filterValue)
    );
  }

  displayCode(code: any): string {
    return code ? code.dial_code : "";
  }

  getCountry() {
    this.orderService.getCountryCode().then((countryCodes) => {
      this.countryCodes = countryCodes.response;
      this.filteredCountryCodes = this.informationForm.controls[
        "altCountryCode"
      ].valueChanges.pipe(
        startWith(""),
        map((value: any) => (typeof value === "string" ? value : value?.name)),
        map((name) => (name ? this._filter(name) : this.countryCodes.slice()))
      );

      const defaultCountry = this.countryCodes.find(
        (c) => c.dial_code === "+91"
      );
      if (defaultCountry) {
        this.informationForm.patchValue({
          altCountryCode: defaultCountry,
        });
      }
    });
  }

  submit() {
    if (this.informationForm.invalid) {
      this.toastr.error("Please fix the errors before updating.");
      return;
    }

    const payload = {
      ...this.informationForm.getRawValue(),
      _id: this.currentUser._id,
    };

    this.orderService.updateCustomer(payload, this.currentUser._id).subscribe({
      next: (result) => {
        let response = result.response;
        if (response) {
          localStorage.setItem("currentUser", JSON.stringify(response));
          this.toastr.success("Success!", "User updated successfully!");
        } else {
          this.toastr.error("Error!", "Unable to update!");
        }
      },
      error: () => {
        this.toastr.error("Error!", "Unable to update!");
      },
    });
  }

  validateCountrySelection(control: any) {
    const value = control.value;
    if (!value) return { required: true };
    if (typeof value === "string") {
      return { invalidSelection: true };
    }
    return null;
  }

  setPhoneValidators(min: number, max: number) {
    const phoneControl = this.informationForm.get("altPhoneNumber");
    phoneControl?.setValidators([
      Validators.required,
      Validators.minLength(min),
      Validators.maxLength(max),
      Validators.pattern(/^[0-9]*$/),
    ]);
    phoneControl?.updateValueAndValidity();
  }
}
