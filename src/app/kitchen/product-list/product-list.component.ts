import { Component, OnInit } from '@angular/core';
import { KitchenService } from '../kitchen.service';
import { CartService } from 'src/app/cart-summary/cart.service';
import { MessageService } from 'src/app/services';
import { MatDialog } from '@angular/material/dialog';
import { CartModalComponent } from 'src/app/cart-modal/cart-modal.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  sortOption = 'featured';

  sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'bestSelling', label: 'Best selling' },
    { value: 'aToZ', label: 'Alphabetically, A–Z' },
    { value: 'zToA', label: 'Alphabetically, Z–A' },
    { value: 'lowToHigh', label: 'Price, low to high' },
    { value: 'highToLow', label: 'Price, high to low' },
    { value: 'oldToNew', label: 'Date, old to new' },
    { value: 'newToOld', label: 'Date, new to old' }
  ];
  currentUser: any = {};

  constructor(private kitchenService: KitchenService, private cartService: CartService, private messageService: MessageService, private dialog: MatDialog) {
     const state = history.state;

    if (state && state.from === 'bestSellers') {
      this.sortOption = "bestSelling";
    }
  }

  ngOnInit() {
    this.products = this.kitchenService.getProducts();
    this.filteredProducts = [...this.products];
    this.currentUser = JSON.parse(localStorage.getItem("currentUser") || "[]")
  }

  applyFilter(filters: any) {
    this.filteredProducts = this.products.filter(p => {
      const matchAvailability =
        !filters.availability ||
        (filters.availability === 'inStock' && p.inStock) ||
        (filters.availability === 'outOfStock' && !p.inStock);
      const matchPrice = p.price >= filters.price.min && p.price <= filters.price.max;
      return matchAvailability && matchPrice;
    });
  }

  sortProducts() {
    if (this.sortOption === 'lowToHigh') {
      this.filteredProducts.sort((a, b) => a.price - b.price);
    } else if (this.sortOption === 'highToLow') {
      this.filteredProducts.sort((a, b) => b.price - a.price);
    }
  }
  handleAddToCart(product: any) {
    this.dialog.open(CartModalComponent, {
      data: { cartCount: 1 },
      panelClass: 'cart-modal-panel'
    });
    console.log('Added to cart:', product);
    this.cartService.addToCart(product, "", product.kitchen, this.currentUser)
      .then((data) => {
        console.log('Cart updated:', data);
        this.messageService.sendMessage({ refresh: true });
      })
      .catch((err) => {
        console.log('Cart updated:', err);
      });
  }

openProductDetails(product: any) {
  console.log('Viewing product:', product);
}
}
