import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class ReviewService {
    baseURL: any = environment.apiUrl

    constructor(private http: HttpClient) { }


    // getProducts() {
    //     return this.http.get<any>('assets/products-small.json')
    //     .toPromise()
    //     .then(res => <any>res.products)
    //     .then(data => { return data; });
    // }
    createReview(formData: any):Observable <any>{
        return this.http
        .post(`${this.baseURL}/review/create`, formData);
    }

    getReview(formData: any):Observable <any>{
        return this.http
        .post(`${this.baseURL}/review/get`, formData);
    }

    update(formData: any):Observable <any>{
        return this.http
        .post(`${this.baseURL}/review/update`, formData);
    }

    uploadFile(data:any, folderName:any):Observable <any> {
        return this.http
        .post(`${this.baseURL}/common/uploadFileS3?folderName=`+folderName, data);
      }

    getAllUserReview (data: any, searchStr: string, userId: any) :Observable <any> {
        let apiUrl = `${this.baseURL}/review/getAllReviews?searchStr=${searchStr}&pageSize=${data.limit}&page=${data.offset}&type=${data.reviewType}&userId=${userId}&status=approved`
          return this.http.get<any>(apiUrl);
       }
}