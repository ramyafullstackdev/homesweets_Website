import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { WishlistService } from 'src/app/my-account/wishlist/wishlist.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
  providers: [WishlistService]
})
export class MyWishlistComponent {
  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [];
  dataSource!: MatTableDataSource<any>;
  totalElements: any;
  tableHeaderConfig: any = [
    {
      value: "product.productName",
      name: "Prodct Name",
      isactive: true
    }, {
      value: "product.productImagePath",
      name: "Product Image",
      isactive: true
    },
    {
      value: "product.quantity",
      name: "Quantity",
      isactive: true
    },
    {
      value: "product.productWeight",
      name: "Weight",
      isactive: true
    },
    {
      value: "product.productCurrentPrice",
      name: "Price",
      isactive: true
    },
    {
      value: "product.totalVal",
      name: "Total Price",
      isactive: true
    },
    {
      value: "action",
      name: "Action",
      isactive: true
    },
  ];
  selectedTableHeader: any = [];
  s3URL: any = environment.s3Url

  loggedUserId!: String;
  searchStr = new FormControl('');
  pageSize: number = 5;
  pageIndex: number = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private WishlistService: WishlistService, private router: Router,
    public dialog: MatDialog, private toastr: ToastrService) {

  }

  ngOnInit() {
    let temp = localStorage.getItem("userId");
    this.loggedUserId = temp ? temp : "";

    console.log(this.tableHeaderConfig, ">>tableHeaderConfig");
    let tempArray = _.filter(this.tableHeaderConfig, { isactive: true });
    this.selectedTableHeader = _.map(tempArray, "value");

    this.columnsToDisplay = _.map(tempArray, "value");



    this.getAllWishlist();

    this.searchStr.valueChanges.subscribe((data) => {
      this.getAllWishlist();
    });

    localStorage.removeItem("selectedReviwe");
  }
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.getAllWishlist();
  }

  getCustomColumn(columnValue: any, rowData?: any): any {
    console.log(columnValue, ">>>splitVal")

    let splitVal = columnValue.split('.');
    console.log(splitVal, ">>>splitVal")
    if (splitVal.length) {
      return rowData[splitVal[0]][splitVal[1]] || '';
    }
  }

  getAllWishlist() {
    const offset = this.pageIndex * this.pageSize;
    const limit = this.pageSize
    const userId = localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser") || "") : ''
    console.log(userId, "userId")
    this.WishlistService.getAllUserWishlist({ offset, limit }, this.searchStr.value || '', userId._id).subscribe({
      next: (result) => {
        console.log(result);
        let response = result.wishlist;
        this.totalElements = result.total;
        this.dataSource = new MatTableDataSource(response);


        // this.dataSource.paginator = this.paginator;
        // this.toastr.success('Success!', 'Load Category');
      },
      error: (e) => {
        console.error(e)
        // this.toastr.error('Error!', 'Load Category');
      },
      complete: () => console.info('complete')
    })
  }


  getColumnName(column: any) {
    let tempArray = _.filter(this.tableHeaderConfig, { value: column });
    return (tempArray && tempArray.length > 0) ? tempArray[0].name : "";
  }

  updateTableSettings(event: any) {
    this.tableHeaderConfig.forEach((header: any) => {
      header.isactive = this.selectedTableHeader.includes(header.value);
    });
    this.columnsToDisplay = this.selectedTableHeader;
    this.displayedColumns = this.selectedTableHeader;
  }

  removebuyItem(cart: any) {
    this.WishlistService.removeSaveLater(cart._id).then(response => {
      console.log(response, ">>>>response")
      this.ngOnInit();
    });
  }
}
