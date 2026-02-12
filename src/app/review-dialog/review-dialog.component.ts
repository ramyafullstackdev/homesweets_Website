import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.scss']
})
export class ReviewDialogComponent {
  s3URL: any = environment.s3Url
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReviewDialogComponent>
  ) {
  }

  close() {
    this.dialogRef.close();
  }

  viewProduct() {
    window.open(this.data.productUrl, '_blank'); // or emit event
  }
}
