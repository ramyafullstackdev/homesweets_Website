import { ViewportScroller } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Event, Router, Scroll } from '@angular/router';
import { NgxUiLoaderConfig, NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'home_sweet';
  config: NgxUiLoaderConfig = {
    bgsColor: 'rgba(12,80,219,0.98)',
    bgsOpacity: 1,
    bgsPosition: POSITION.bottomRight,
    bgsSize: 40,
    bgsType: SPINNER.threeStrings,
    fgsColor: 'rgba(12,80,219,0.98)',
    fgsPosition: POSITION.centerCenter
  };

  get isAdminLoggedIn(): boolean {
    return localStorage.getItem('adminLoggedIn') === 'true';
  }

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller,
    private changeDetectorRef: ChangeDetectorRef,
    private ngxUiLoaderService: NgxUiLoaderService
  ) {
    router.events.pipe(
      filter((event: Event): event is Scroll => event instanceof Scroll)
    ).subscribe(e => {
      changeDetectorRef.detectChanges();
      if (e.position) {
        viewportScroller.scrollToPosition(e.position);
      }
    });
  }

  ngOnInit() {
    this.config = this.ngxUiLoaderService.getDefaultConfig();
  }
}
