import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class MainService {
    baseURL: any = environment.apiUrl
    apiUrl : any = environment.baseUrl;

    constructor(private http: HttpClient) { }

    // getCategory() {
    //     return this.http.get<any>('assets/products-small.json')
    //     .toPromise()
    //     .then(res => <any[]>res.category)
    //     .then(data => { return data; });
    //     // let apiUrl = `${this.baseURL}/category`;
    //     //     // if(data.categoryName){
    //     //     apiUrl = apiUrl + "?activeStatus=Active";
    //     //     // }
    //     //     // if(data.tags){
    //     //     // apiUrl = apiUrl + "&tags="+data.tags;
    //     //     // }
    //     //     // return this.http.get<any>(apiUrl)
    //     // return this.http.get<any>(apiUrl)
    //     // .toPromise()
    //     // .then(res => <any>res.response)
    //     // .then(data => { 
    //     //     console.log(data,">>>>DATA")
    //     //     return data; 
    //     // });
    // }

    getCategory (inputdata:any) {
        let apiUrl = `${this.baseURL}/category/getCategories?isActive=true&mainPageDisplay=`+inputdata.mainDisplay;
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.data)
        .then(data => { 

            return data; 
        });;
       }

    getFile(data: any): Observable<any> {
        return this.http
        .get(`${this.apiUrl}getfile`,{
            params: data,
             responseType: 'blob' });
    }

    getS3File(data:any):Observable<any>{
        return this.http
        .get(`${this.baseURL}/common/getS3File`,{
            params: data,
             responseType: 'blob' });
    }

    getBanners(){
        let apiUrl = `${this.baseURL}/banner`;
        apiUrl = apiUrl + "?activeStatus=Active";
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }

    getOffers(){
        let apiUrl = `${this.baseURL}/offers`;
        apiUrl = apiUrl + "?activeStatus=Active";
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }
    getAllProdcts(data: any): Promise<any> {
        let apiUrl = `${this.baseURL}/product/getAllProductsForCard`;
        return this.http.post<any>(apiUrl, data)
          .toPromise()
          .then(res => <any>res.response)
          .then(data => {
            console.log(data, ">>> product Created");
            return data;
          });
    }

    // getBestSellers () {
    //     return this.http.get<any>('assets/products-small.json')
    //     .toPromise()
    //     .then(res => <any[]>res.bestSellers)
    //     .then(data => { return data; });
    // }
    getBestSellers() {
        let apiUrl = `${this.baseURL}/kitchen/listBestsellers`;
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }


    // getOffers(){
    //     return this.http.get<any>('assets/products-small.json')
    //     .toPromise()
    //     .then(res => <any[]>res.offers)
    //     .then(data => { return data; });
    // }
    getNewKitchens () {
        let apiUrl = `${this.baseURL}/kitchen/newKitchens`;
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }

    getBestKitchens() {
        let apiUrl = `${this.baseURL}/kitchen/bestKitchens`;
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }

    // createFav(data: any){
    //     let apiUrl = `${this.baseURL}/kitchen/bestKitchens`;
    //     return this.http.get<any>(apiUrl)
    //     .toPromise()
    //     .then(res => <any>res.response)
    //     .then(data => { 
    //         console.log(data,">>>>DATA")
    //         return data; 
    //     });
    // }
    createCart(data: any): Promise<any> {
        const apiUrl = `${this.baseURL}/cart/create`;
        return this.http.post<any>(apiUrl, data)
          .toPromise()
          .then(res => <any>res.response)
          .then(data => {
            console.log(data, ">>> Cart Created");
            return data;
          });
      }  

    createFav(data: any): Promise<any> {
        const apiUrl = `${this.baseURL}/favorite/create`;
        return this.http.post<any>(apiUrl, data)
          .toPromise()
          .then(res => <any>res.response)
          .then(data => {
            console.log(data, ">>> Favorite Created");
            return data;
          });
      }      

      getfav(userId: any) {
        let apiUrl = `${this.baseURL}/favorite?userId=${userId}`;
        return this.http.get<any>(apiUrl)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { 
            console.log(data,">>>>DATA")
            return data; 
        });
    }

    createLoginFavorite(formData: any):Observable <any>{
        return this.http
        .post(`${this.baseURL}/favorite/createLogin`, formData);
    }
    
     createInquiry(data: any): Promise<any> {
        const apiUrl = `${this.baseURL}/inquiry/create`;
        return this.http.post<any>(apiUrl, data)
          .toPromise()
          .then(res => <any>res.response)
          .then(data => {
            console.log(data, ">>> inqiry Created");
            return data;
          });
      }   

    getAllUserReview(data: any, searchStr: string, userId: any): Observable<any> {
        let apiUrl = `${this.baseURL}/review/getAllReviews?searchStr=${searchStr}&pageSize=${data.limit}&page=${data.offset}&type=${data.reviewType}&userId=${userId}&status=approved&rating=${data.rating}`
        return this.http.get<any>(apiUrl);
    }
}