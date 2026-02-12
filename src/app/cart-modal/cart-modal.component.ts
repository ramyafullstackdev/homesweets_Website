import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss']
})
export class CartModalComponent {
  constructor(
    public dialogRef: MatDialogRef<CartModalComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { cartCount: number }
  ) {}

  get cartCount() {
    return this.data.cartCount;
  }
  close() {
    this.dialogRef.close();
  }
  goToCart() {
    this.dialogRef.close();
    this.router.navigate(['/cart']);
  }
}
