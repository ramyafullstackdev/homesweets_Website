import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollingBannerComponent } from './scrolling-banner.component';

describe('ScrollingBannerComponent', () => {
  let component: ScrollingBannerComponent;
  let fixture: ComponentFixture<ScrollingBannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScrollingBannerComponent]
    });
    fixture = TestBed.createComponent(ScrollingBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
