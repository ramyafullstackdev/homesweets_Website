import { Component, ElementRef, ViewChild } from '@angular/core';
import {FormControl,FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MessageService } from '../services';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, debounceTime, map, startWith } from 'rxjs';
import { MainService } from '../main/main.service';
import { KitchenService } from './kitchen.service';
import { environment } from 'src/environments/environment';
import { Tree } from 'primeng/tree';

@Component({
  selector: 'app-kitchen',
  templateUrl: './kitchen.component.html',
  styleUrls: ['./kitchen.component.scss'],
  providers: [MainService, KitchenService]

})
export class KitchenComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement> ;

  searchWord: any ;
  currentRoute: any;
  categoryName:any;
  searchFormGroup = this._formBuilder.group({
    searchCtrl : new FormControl('')
  })
  stateCtrl = new FormControl('');
  s3ApiUrl = environment.s3Api;
  filteredSearch!: Observable<any[]>;
  enableKitchenView: Boolean = false;
  enableProductView: Boolean = true;
  states: any[] = [
    {
      name: 'Arkansas',
      population: '2.978M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg',
    },
    {
      name: 'California',
      population: '39.14M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg',
    },
    {
      name: 'Florida',
      population: '20.27M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg',
    },
    {
      name: 'Texas',
      population: '27.47M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg',
    },
  ];

  searchResult : any[] = [];
  categoryList: any = [];
  reloadComp: boolean = true;

  constructor(private messageService: MessageService, 
    private router: Router, 
    private _formBuilder: FormBuilder, 
    private kitchenService: KitchenService,
    private mainService: MainService,private route: ActivatedRoute){
    // this.filteredSearch = this.searchFormGroup.controls["searchCtrl"].valueChanges.pipe(
    //   startWith(''),
    //   map(state => 
    //     (state ? this._filterStates(state) : this.searchResult.slice())
    //   ),
    // );
    this.route.params.subscribe(params => {
      this.reloadComp = false
      setTimeout(() => {
        this.ngOnInit()
        this.reloadComp = true
      }, 100);
    });

  }

  ngOnInit(){ 
    this.enableKitchenView = false;
    this.enableProductView = true;
    this.currentRoute = this.router.url;
    this.categoryName = this.currentRoute.replace('/',"");
    let fromHome = localStorage.getItem("fromSearch");
    if(fromHome != "true") {
      localStorage.removeItem("searchSelection");
      localStorage.removeItem("selectedKitchen");
    }
    localStorage.removeItem("selectedProduct");
    localStorage.setItem("currentCategory", this.categoryName);
    this.mainService.getCategory({}).then(result => {
      this.categoryList = result;
    });
    this.kitchenService.getSearchData({searchVal: "a"}).then(result => {
      this.searchResult = result.result;
      this.filteredSearch = this.searchFormGroup.controls["searchCtrl"].valueChanges.pipe(
        debounceTime(1500),
        startWith(''),
        map(state => 
          (state ? this._filterStates(state) : this.searchResult.slice())
        ),
      );
    });
  }

  filter(event:any): void {
    if(event.data == null) {
      this.ngOnInit();
      this.enableKitchenView = false;
      this.enableProductView = false;
      setTimeout(()=>{
        this.enableProductView = true;
      },100)
    }
    // const filterValue = this.input.nativeElement.value.toLowerCase();
    // console.log(event,">>>filterValue")
    // this.filteredOptions = this.options.filter(o => o.toLowerCase().includes(filterValue));
  }
  selectedOption(option:any) {
    this.enableKitchenView = false;
    this.enableProductView = false;
    setTimeout(()=>{
      if(option.productName){
        this.enableKitchenView = false;
        this.enableProductView = true;
      }else{
        this.enableKitchenView = true;  
        this.enableProductView = false;
      }
      localStorage.setItem("searchSelection", JSON.stringify(option));
    },100)

  }

  tabClick(key:any) {
    this.enableKitchenView = (key == 'kitchen') ? true: false;
    this.enableProductView = (key == 'product') ? true: false;
  }
  private _filterStates(value: string): any {
    const filterValue = value.toLowerCase();
    // setTimeout(()=>{
    this.kitchenService.getSearchData({searchVal: filterValue}).then(result => {
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


  onEnter() {
    let obj = {
      searchKey: this.searchWord,
      isFilter: true
    }
    this.messageService.sendMessage(obj);
  }

  
  formattedCategoryName(categoryName: string): string {
    if (!this.categoryName) return '';
    
    return categoryName
      .split("?")[0]
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}
