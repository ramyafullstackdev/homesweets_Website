import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-view',
  templateUrl: './dialog-view.component.html',
  styleUrls: ['./dialog-view.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class DialogViewComponent {
constructor(
      public dialogRef: MatDialogRef<DialogViewComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ){}

    onNoClick(): void {
      this.dialogRef.close();
    }
}
