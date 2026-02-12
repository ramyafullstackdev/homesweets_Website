import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
    baseURL: any = environment.apiUrl;

    private cartData: any[] = [];
    private cartProduct: any[] = [];
    private cartUpdated = new Subject<any>();
    cartUpdated$ = this.cartUpdated.asObservable();

    constructor(private http: HttpClient) { }

    async addToCart(productParam: any, kitchen: string, kitchenData?: any, currentUser?: any) {
        this.cartData = JSON.parse(localStorage.getItem("cartData") || "[]");
        this.cartProduct = JSON.parse(localStorage.getItem("cartProduct") || "[]");
        const product = JSON.parse(JSON.stringify(productParam));
        const selectedPrice = product.prices.find((p: any) => p.selected) || product.prices[0];

        product.productCurrentPrice = product.preOrder
            ? selectedPrice.currentPrice
            : selectedPrice.productPrice
                ? await this.currentPriceCalculation(selectedPrice.productPrice, product.productDiscount)
                : selectedPrice.currentPrice;

        product.productWeight = selectedPrice.weight;
        product.stock = selectedPrice.stock;
        product.onStock = selectedPrice.onStock;
        product.quantity = product.quantity || 1;

        const indexExists = this.cartData.findIndex(cart =>
            cart.productId === product._id && cart.productWeight === product.productWeight
        );

        if (indexExists !== -1) {
            this.cartData[indexExists].quantity += product.quantity;
            this.cartData[indexExists].productCurrentPrice = product.productCurrentPrice;
            this.cartData[indexExists].productWeight = product.productWeight;
            product.quantity = this.cartData[indexExists].quantity;
        } else {
            this.cartProduct.push(product);
            this.cartData.push({
                productId: product._id,
                productName: product.productName,
                productImagePath: product.productImagePath,
                productDescription: product.productDescription,
                productCurrentPrice: product.productCurrentPrice,
                discount: product.productDiscount,
                quantity: product.quantity,
                userId: product.userId,
                productWeight: product.productWeight,
                stock: product.stock,
                onStock: product.onStock,
                preOrder: product.preOrder,
                kitchenId: kitchenData ? kitchenData._id : product.userId,
                kitchenName: kitchenData ? kitchenData.kitchenDetails.kitchenForm.kitchenName : 'Offers'
            });
        }

        const groupedByKitchen = this.groupCartByKitchen(this.cartData);
        const cartPayload = {
            user_id: currentUser?._id || product.userId,
            cart_items: groupedByKitchen
        };

        return this.http.post<any>(`${this.baseURL}/cart/create`, cartPayload)
            .toPromise()
            .then(res => <any>res)
            .then(data => {
                localStorage.setItem('cartData', JSON.stringify(this.cartData));
                localStorage.setItem('cartProduct', JSON.stringify(this.cartProduct));
                return product;
            });
    }

    private groupCartByKitchen(cartData: any[]) {
        const grouped: any = {};
        cartData.forEach(item => {
            const kitchenId = item.kitchenId || 'default';
            const kitchenName = item.kitchenName || 'Unknown Kitchen';

            if (!grouped[kitchenId]) {
                grouped[kitchenId] = {
                    kitchen_id: kitchenId,
                    kitchen_name: kitchenName,
                    items: []
                };
            }

            grouped[kitchenId].items.push({
                product_id: item.productId,
                name: item.productName,
                qty: item.quantity,
                price: item.productCurrentPrice
            });
        });

        return Object.values(grouped);
    }

    // cart.service.ts
    updateCartQuantity(cartItem: any, action: '+' | '-' | null, currentUser?: any) {
            this.cartData = JSON.parse(localStorage.getItem("cartData") || "[]");
        this.cartProduct = JSON.parse(localStorage.getItem("cartProduct") || "[]");
        const index = this.cartData.findIndex(item =>
            item.productId === cartItem.productId && item.productWeight === cartItem.productWeight
        );

        if (index === -1) return;

        const cart = this.cartData[index];

        if (action === '-') cart.quantity = Math.max(1, cart.quantity - 1);
        if (action === '+') cart.quantity++;
        if (action === null) cart.quantity = cartItem.quantity;

        if (cart.quantity > 500 && cart.preOrder) {
            this.cartUpdated.next({ inquiry: cart });
            return;
        }

        cart.totalVal = Math.round(cart.quantity * cart.productCurrentPrice);
        this.cartData[index].totalVal = cart.totalVal;

        this.syncCartToBackend(currentUser);
    }

    private syncCartToBackend(currentUser: any) {
        const groupedByKitchen = this.groupCartByKitchen(this.cartData);
        const cartPayload = {
            user_id: currentUser._id,
            cart_items: groupedByKitchen
        };

        this.http.post(`${this.baseURL}/cart/create`, cartPayload).subscribe(() => {
            localStorage.setItem('cartData', JSON.stringify(this.cartData));
            localStorage.setItem('cartProduct', JSON.stringify(this.cartProduct));
            this.cartUpdated.next({ refresh: true });
        });
    }

    private async currentPriceCalculation(basePrice: number, discount: number): Promise<number> {
        return basePrice - (basePrice * (discount || 0) / 100);
    }
    createCart(cartPayload: any): Promise<any> {
        return this.http.post(`${this.baseURL}/cart/create`, cartPayload).toPromise();
    }
removeItem(cart: any, currentUser: any): Promise<any[]> {
    this.cartData = JSON.parse(localStorage.getItem("cartData") || "[]");
        this.cartProduct = JSON.parse(localStorage.getItem("cartProduct") || "[]");
  const index = this.cartData.findIndex(item =>
    item.productId === cart.productId && item.productWeight === cart.productWeight
  );

  if (index === -1) return Promise.resolve(this.cartData);

  this.cartData.splice(index, 1);

  const groupedByKitchen = this.groupCartByKitchen(this.cartData);
  const cartPayload = {
    user_id: currentUser._id,
    cart_items: groupedByKitchen,
      mode: 'replace' // or 'merge'
  };

  return this.http.post(`${this.baseURL}/cart/create`, cartPayload).toPromise().then(() => {
    localStorage.setItem("cartData", JSON.stringify(this.cartData));
    localStorage.setItem("cartProduct", JSON.stringify(this.cartProduct));
    return this.cartData;
  });
}


    getCartSummary() {
        return this.http.get<any>('assets/products-small.json')
            .toPromise()
            .then(res => <any[]>res.cartSummary)
            .then(data => { return data; });
    }

    saveLater(cartData: any, userId: any): Observable<any> {
        return this.http
            .post(`${this.baseURL}/common/savelater?userId=` + userId, cartData);
    }

    getBuyLater(userId: any) {
        return this.http.get<any>(`${this.baseURL}/common/getBuyLaters?userId=` + userId)
            .toPromise()
            .then(res => <any>res)
            .then(data => { return data.response; });
    }

    removeSaveLater(id: any) {
        return this.http.get<any>(`${this.baseURL}/common/removeBuyLater?id=` + id)
            .toPromise()
            .then(res => <any>res)
            .then(data => { return data.response; });
    }

}