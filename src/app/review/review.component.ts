import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReviewService } from './review.service';
import { MessageService } from '../services';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderComponent, NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from 'src/environments/environment';
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
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  providers: [ReviewService, OrderService]
})
export class ReviewComponent {

  inputdata: any;
  editdata: any;
  closemessage = 'closed using directive';
  reviewFrom: FormGroup;
  mode: string = 'add';
  rating: any
  get reviewFromAbsCtrl(): { [key: string]: AbstractControl } {
    return this.reviewFrom.controls;
  }
  file!: File
  imageURL: string = "";
  fileName: String = "";
  s3URL: any = environment.s3Url
  filteredCountryCodes!: Observable<any[]>;
  countryCodes: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private ref: MatDialogRef<ReviewComponent>, private fb: FormBuilder, private reviewServices: ReviewService,private messageService: MessageService, private toastr : ToastrService, private ngxLoader: NgxUiLoaderService, private orderService: OrderService) {
    if(data.isLoggedIn){
      this.reviewFrom = this.fb.group({
        titleReview: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        review: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
        rating: ["", [Validators.required]],
        reviewImage: [""],
        reviewImageName: [''],
        _id: ['']
      });
    } else {
      this.reviewFrom = this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        phoneNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
        countryCode: [null as CountryCode | null, Validators.required],
        email: ['', [
          Validators.required,
          Validators.email,
        ]],
        titleReview: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        review: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
        rating: ["", [Validators.required]],
        reviewImage: [""],
        reviewImageName: [''],
        _id: ['']
      });
    }
    

  }

  displayCode(code: any): string {
    return code ? `${code.name} (${code.dial_code})` : '';
  }
  
  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.countryCodes.filter(option =>
      option.name.toLowerCase().includes(filterValue) ||
      option.dial_code.includes(filterValue)
    );
  }

  ngOnInit(): void {
    this.inputdata = this.data;
   console.log(this.inputdata.data)
    if (this.inputdata.data.data.length) {
      console.log(this.inputdata.data.data)
      this.reviewFrom.patchValue(this.inputdata.data.data[0]);
      this.imageURL = this.inputdata.data.data[0]["imagePath"] ? this.s3URL + this.inputdata.data.data[0]["imagePath"]: "";
      this.mode = 'update';
    }
     this.getCountry()
        this.filteredCountryCodes = this.reviewFrom.controls['countryCode'].valueChanges.pipe(
          startWith(''),
          map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
          map(name => name ? this._filter(name) : this.countryCodes.slice())
        );
  }

  closepopup() {
    this.ref.close('Closed using function');
  }

  submit() {
    console.log(this.reviewFrom)
    if (this.reviewFrom.valid) {
      let data = this.reviewFrom.getRawValue();
      data.isLoggedIn = this.data.isLoggedIn;
      data.userId = this.inputdata.data.userId
      if(this.inputdata.data.productId){
        data.productId = this.inputdata.data.productId
        data.offers = this.inputdata.data.offers
      } else if(this.inputdata.data.kitchenId) {
        data.kitchenId = this.inputdata.data.kitchenId
      }

      if(this.mode !== 'update'){
        delete data._id;
        this.create(data)
      } else {
        this.update(data)
      }
      console.log(data,"data")
    }
  }
  
  removeImage() {
    this.imageURL = "";
    this.fileName = "";
    this.reviewFrom.controls["reviewImage"].setValue("");
    this.reviewFrom.controls["reviewImageName"].setValue("");
    let data = this.reviewFrom.getRawValue();
    data.isLoggedIn = this.data.isLoggedIn;
    data.userId = this.inputdata.data.userId
    if (this.inputdata.data.productId) {
      data.productId = this.inputdata.data.productId
      data.offers = this.inputdata.data.offers
    } else if (this.inputdata.data.kitchenId) {
      data.kitchenId = this.inputdata.data.kitchenId
    }
    this.update(data, "removeImage");

  }

  create(data: any){
    this.reviewServices.createReview(data).subscribe({
      next: (result) => {
        console.log(result, ">>  RESULT");
        let response = result.response;
        if(result.meta.status === 200) {
          if(response.length && response[0].productName){
            localStorage.setItem("selectedProduct", JSON.stringify(response[0]));
          } else {
            localStorage.setItem("selectedKitchen", JSON.stringify(response[0]));
          }
          if(!data.isLoggedIn){
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("currentUser", JSON.stringify(result.userData));
            let obj = {
              key:"Account"
            }
            this.messageService.sendMessage(obj);
          }
          this.toastr.success('Sucess!', 'Review created sucessflly');
          this.closepopup();
        }else{
          this.toastr.error('Error!', 'Unable to create review');
        }
      },
      error: (e) => {
        console.error(e)
        this.toastr.error('Error!', 'Unable to create review');
      },
      complete: () => console.info('complete')
    });
  }

  update(data: any, type?: string) {
    this.reviewServices.update(data).subscribe({
      next: (result) => {
        console.log(result, ">>  RESULT");
        let response = result.response;
        if(result.meta.status === 200) {
          if(response.length && response[0].productName){
            localStorage.setItem("selectedProduct", JSON.stringify(response[0]));
          } else {
            localStorage.setItem("selectedKitchen", JSON.stringify(response[0]));
          }
          this.toastr.success('Sucess!', 'Review updated sucessflly');
          if(type !== "removeImage"){
          this.closepopup();
          }
        }else{
          this.toastr.error('Error!', 'Unable to update review');
        }
      },
      error: (e) => {
        console.error(e)
        this.toastr.error('Error!', 'Unable to update review');
      },
      complete: () => console.info('complete')
    });
  }

  // create(data: any) {
  //   this.reportTypeService.createReportType(data).subscribe(
  //     (res: any) => {
  //       const resData = res;

  //       if (resData.status) {
  //         this.commonSerivce.showSuccess('Report Type', res.statusMessage);
  //         this.closepopup();
  //       } else {
  //         this.commonSerivce.showError('Report Type', res.statusMessage);
  //       }
  //     },
  //     (error: any) => {
  //       console.error('Error creating data:', error);

  //       if (error.error && error.error.status === false) {
  //         // Server returned an error response
  //         this.commonSerivce.showError('Report Type', error.error.errors ? error.error.errors[0]: error.error.error);
  //         // this.commonSerivce.showError('Report Type', error.error.error.code == 11000 ? 'Report Type Name already exists!' : 'Error while creating record!');
  //       } else {
  //         // An unexpected error occurred
  //         this.commonSerivce.showError('Report Type', 'An unexpected error occurred while creating the record.');
  //       }
  //     }
  //   );
  // }

  onFileSelected(event: any): void {
    console.log(event.target.files);
    this.file = event.target.files[0];
    this.ngxLoader.start();
    const formData = new FormData();
    formData.append("image", this.file);
    this.reviewServices.uploadFile(formData,"review").subscribe({
      next: (result) => {
        if (result.image) {
          this.ngxLoader.stop();
          this.reviewFrom.controls["reviewImage"].setValue(result.image);
          this.reviewFrom.controls["reviewImageName"].setValue(result.name);
          console.log(this.reviewFrom.getRawValue())
          this.toastr.success('Success!', 'File Uploaded');
        } else {
          this.toastr.error('Error!', 'Invalid File');
        }
      },
      error: (e) => console.error(e),
      complete: () => console.info('complete')
    });
    if (this.file) {

      this.fileName = this.file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.imageURL = reader.result as string;
      }
      reader.readAsDataURL(this.file)
    }
  }

    getCountry() {
    this.orderService.getCountryCode().then(countryCodes => {
      this.countryCodes = countryCodes.response || [];
      const defaultCountry = this.countryCodes.find(c => c.dial_code === '+91');
      if (defaultCountry) {
        this.reviewFrom.patchValue({ countryCode: defaultCountry });
      }
    }).catch(() => {});
  }

}
