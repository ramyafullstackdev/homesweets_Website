import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class ProductService {
    baseURL: any = environment.apiUrl

    constructor(private http: HttpClient) { }


    // getProducts() {
    //     return this.http.get<any>('assets/products-small.json')
    //     .toPromise()
    //     .then(res => <any>res.products)
    //     .then(data => { return data; });
    // }
    getProducts(data:any) {
        let apiUrl = `${this.baseURL}/product/getbyKitchen/`+data.kitchenId+`?searchVal=`+data.searchVal+`&loadOthers=`+data.loadOthers+`&sortOption=`+data.sortOption+`&availability=`+JSON.stringify(data.availability)+`&priceRange=`+JSON.stringify(data.priceRange)+`&categoryIds=`+JSON.stringify(data.categoryIds);
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }

    getselectedProdcts(data:any) {
        console.log(data,"data")
        let apiUrl = `${this.baseURL}/product/selectedProdcts`;
        return this.http.post<any>(apiUrl, data)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }

     getFaq(data:any) {
        let apiUrl = `${this.baseURL}/faq/getAllByProduct`+`?product=`+ data.productId +`&kitchen=`+data.kitchenId
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }
}