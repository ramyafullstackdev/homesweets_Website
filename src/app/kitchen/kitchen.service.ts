import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class KitchenService {
    baseURL: any = environment.apiUrl;

    constructor(private http: HttpClient) { }


    getKitchens(data:any) {
        let apiUrl = `${this.baseURL}/kitchen/listByCategory?category=`+data.category+
        `&searchName=`+data.searchName+`&loadOthers=`+ data.loadOthers;
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }

    getSearchData(data:any){
        let apiUrl = `${this.baseURL}/common/searchData?value=`+data.searchVal;
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }

    getCategories () :Observable <any> {
        let apiUrl = `${this.baseURL}/category/getCategories?isActive=true`;
          return this.http.get<any>(apiUrl);
       }

  getAllParentCategories(): Observable<any> {
    let apiUrl = `${this.baseURL}/category/getAllParentCategories`;
    return this.http.get<any>(apiUrl);
  }

        getProducts() {
    return [
      {
        name: 'Palakara Petti',
        category: 'Tamil Nadu Special',
        price: 1799,
        oldPrice: 1949,
        inStock: true,
        rating: 4.82,
        image: 'assets/images/palakara-petti.png',
        offer: 'Get 30% Off'
      },
      {
        name: 'Tirunelveli Halwa (Tin)',
        category: 'Packed in Tin',
        price: 129,
        oldPrice: 149,
        inStock: true,
        rating: 4.74,
        image: 'assets/images/halwa.png',
        offer: 'Get 30% Off'
      }
      // more products...
    ];}

    getCategoriesForFilter(data: any): Observable<any> {
    let apiUrl = `${this.baseURL}/category/${data.kitchen ? "getCategoriesForKitchenFilter" : "getCategoriesForFilter"}`;
    return this.http.post<any>(apiUrl,data);
  }
}