import { ViewportScroller } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router, Scroll } from '@angular/router';
import { NgxUiLoaderConfig, NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { filter, observeOn, scan } from 'rxjs/operators';
// import { asyncScheduler } from 'rxjs';


// interface ScrollPositionRestore {
//   event: Event;
//   positions: { [K: number]: number };
//   trigger: 'imperative' | 'popstate';
//   idToRestore: number;
// }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  // @ViewChild('contentArea') private contentArea: ElementRef<HTMLMainElement>;

  title = 'home_sweet';
  config: NgxUiLoaderConfig= {
    bgsColor: 'rgba(12,80,219,0.98)',
    bgsOpacity: 1,
    bgsPosition: POSITION.bottomRight,
    bgsSize: 40,
    bgsType: SPINNER.threeStrings,
    fgsColor: 'rgba(12,80,219,0.98)',
    fgsPosition: POSITION.centerCenter
  };

  constructor(private router:Router,
    private viewportScroller: ViewportScroller,
    private changeDetectorRef: ChangeDetectorRef,
    private ngxUiLoaderService: NgxUiLoaderService){
      router.events.pipe(filter((event: Event): event is Scroll => event instanceof Scroll)
      ).subscribe(e => {
        console.log(e, ">>>>>>POSITION")
        // fetch('http://example.com/movies.json').then(response => {
          // this.movieData = response.json();
          // update the template with the data before restoring scroll
          changeDetectorRef.detectChanges();
  
          if (e.position) {
            viewportScroller.scrollToPosition(e.position);
          }
        });
      // });
    }
  ngOnInit() {
    this.config = this.ngxUiLoaderService.getDefaultConfig();
    // this.router.events.pipe(filter((event: Event): event is Scroll => event instanceof Scroll)
    // ).subscribe(e => {
    //   console.log(e, ">>>>>>POSITION")
    //   // fetch('http://example.com/movies.json').then(response => {
    //     // this.movieData = response.json();
    //     // update the template with the data before restoring scroll
    //     this.changeDetectorRef.detectChanges();

    //     if (e.position) {
    //       this.viewportScroller.scrollToPosition(e.position);
    //     }
    //   });
    // this.router.navigate(['home']);
  }
}
