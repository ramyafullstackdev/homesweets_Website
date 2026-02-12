import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { ReviewService } from 'src/app/review/review.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-review',
  templateUrl: './my-review.component.html',
  styleUrls: ['./my-review.component.scss'],
  providers: [ReviewService]
})
export class MyReviewComponent {
  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [];
  dataSource!: MatTableDataSource<any>;
  totalElements: any;
  reviewType: any = "product";
  reviewConfig: any[] = [
    {
      name: "Product",
      value: "product"
    },
    {
      name: "Kitchen",
      value: "kitchen"
    }
  ];
  tableHeaderConfig: any = [
    {
        value: "titleReview",
        name: "Title",
        isactive: true
    },{
        value: "imagePath",
        name: "Reviwe Image",
        isactive: true
    },
    {
        value: "review",
        name: "Reviwe",
        isactive: true
    },
    {
        value: "rating",
        name: "Rating",
        isactive: true,
    }
];
  selectedTableHeader: any = [];
  s3URL: any = environment.s3Url

  loggedUserId!: String;
  searchStr = new FormControl('');
  pageSize: number = 5;
  pageIndex: number = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private ReviewService: ReviewService, private router: Router,
    public dialog: MatDialog,     private toastr: ToastrService    ){

  }

  ngOnInit() {
    let temp = localStorage.getItem("userId");
    this.loggedUserId = temp ? temp : "";

    console.log(this.tableHeaderConfig, ">>tableHeaderConfig");
    let tempArray = _.filter(this.tableHeaderConfig, { isactive: true });
    this.selectedTableHeader = _.map(tempArray, "value");

    this.columnsToDisplay = _.map(tempArray, "value");

  

      this.getAllReviwes();

    this.searchStr.valueChanges.subscribe((data) => {
        this.getAllReviwes();
    });

    localStorage.removeItem("selectedReviwe");
  }
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
      this.getAllReviwes();
  }

  onReviewTypeChange(value: any) {
    console.log('Selected Review Type:', value);
    this.getAllReviwes()
  }
  getAllReviwes() {
    const offset = this.pageIndex * this.pageSize;
    const limit = this.pageSize
    const userId = localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser") || "") : ''
    console.log(userId,"userId")
    this.ReviewService.getAllUserReview({ offset, limit, reviewType:this.reviewType }, this.searchStr.value || '' , userId._id).subscribe({
      next: (result) => {
        console.log(result);
        let response = result.reviews;
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
    this.tableHeaderConfig.forEach((header:any) => {
      header.isactive = this.selectedTableHeader.includes(header.value);
    });
    this.columnsToDisplay = this.selectedTableHeader;
    this.displayedColumns = this.selectedTableHeader;
  }

}
