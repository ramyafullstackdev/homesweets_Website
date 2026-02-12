import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  baseURL: any = environment.apiUrl

  constructor(private http: HttpClient) { }

  getAllUserWishlist(data: any, searchStr: string, userId: any): Observable<any> {
    let apiUrl = `${this.baseURL}/common/getAllBuylaters?searchStr=${searchStr}&pageSize=${data.limit}&page=${data.offset}&userId=${userId}&status=approved`
    return this.http.get<any>(apiUrl);
  }

  removeSaveLater(id: any) {
    return this.http.get<any>(`${this.baseURL}/common/removeBuyLater?id=` + id)
      .toPromise()
      .then(res => <any>res)
      .then(data => { return data.response; });
  }
}
