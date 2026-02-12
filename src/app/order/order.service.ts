import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class OrderService {
    baseURL : any = environment.apiUrl;
    constructor(private http: HttpClient) { }


    // getAddress() {
    //     return this.http.get<any>('assets/products-small.json')
    //     .toPromise()
    //     .then(res => <any>res.address)
    //     .then(data => { return data; });
    // }

    getAddress(val: any){
        return this.http.get<any>(`${this.baseURL}/address?userName=`+val.userName)
        .toPromise()
        .then(res => <any>res)
        .then(data => { return data; });
    }

    // getOrders() {
    //     return this.http.get<any>('assets/products-small.json')
    //     .toPromise()
    //     .then(res => <any>res.orders)
    //     .then(data => { return data; });
    // }
     getOrders(userId: any) {
        return  this.http.get<any>(`${this.baseURL}/orders?userId=`+userId)
        .toPromise()
        .then(res => <any>res.response)
        .then(data => { return data; });
    }
    getCards() {
        return this.http.get<any>('assets/products-small.json')
        .toPromise()
        .then(res => <any>res.cards)
        .then(data => { return data; });
    }

    getAllCities():Observable<any>{
        return this.http.get<any>(`${this.baseURL}/common/allCities`)
    }

    getVouchers() {
        return this.http.get<any>('assets/products-small.json')
        .toPromise()
        .then(res => <any>res.vouchers)
        .then(data => { return data; });
    }

    getCountry() {
        return this.http.get<any>(`${this.baseURL}/common/countries`)
        .toPromise()
        .then(res => <any>res)
        .then(data => { return data; });
    }

    getStates() {
        return this.http.get<any>(`${this.baseURL}/common/states`)
        .toPromise()
        .then(res => <any>res)
        .then(data => { return data; });
    }

    getCities(stateCode: any) {
        return this.http.get<any>(`${this.baseURL}/common/cities?stateCode=`+stateCode)
        .toPromise()
        .then(res => <any>res)
        .then(data => { return data; });
    }

    verifyCityPincode (city: any) {
        return this.http.get<any>('https://api.postalpincode.in/postoffice/'+city)
        .toPromise()
        .then(res => <any>res)
        .then(data => { return data; });
    }

    getOTP(number: any) {
        const encodedNumber = encodeURIComponent(`${number}`);
        return this.http.get<any>(`${this.baseURL}/common/getOTP?number=${encodedNumber}`)
        .toPromise()
        .then(res => <any>res)
        .then(data => { return data.response; });
    }

    createCustomer(formData: any):Observable <any>{
        return this.http
        .post(`${this.baseURL}/users/create`, formData);
    }

    updateCustomer(formData: any, id:any):Observable <any>{
        return this.http
        .post(`${this.baseURL}/users/update/${id}`, formData);
    }


    customerLogin(formData: any):Observable<any> {
        return this.http
        .post(`${this.baseURL}/users/customerLogin`, formData);
    }
    customerValidation(formData: any):Observable<any> {
        return this.http
        .post(`${this.baseURL}/users/customerValidation`, formData);
    }
    createAddress(formData: any, userName: any): Observable<any> {
        return this.http
        .post(`${this.baseURL}/address/create?userName=`+userName, formData);
    }
    placeOrder(formData: any, userName: any): Observable<any> {
        return this.http
        .post(`${this.baseURL}/orders/create?userName=`+userName, formData);
    }
    deleteAddress(id: any) {
        return this.http.get<any>(`${this.baseURL}/address/deleteAddress?id=`+id)
        .toPromise()
        .then(res => <any>res)
        .then(data => { return data.response; });
    }

    createPaymentHistory(data:any): Observable<any> {
        return this.http
        .post(`${this.baseURL}/payment-history/create`, data);
    }

    getCountryCode(){
        return this.http.get<any>(`${this.baseURL}/country-code`)
        .toPromise()
        .then(res => <any>res)
        .then(data => { return data; });
    }

    updateAddress(formData: any, id: any): Observable<any> {
        return this.http
            .post(`${this.baseURL}/address/update/${id}`, formData);
    }


}