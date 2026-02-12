import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyReviewComponent } from './my-review.component';

describe('MyReviewComponent', () => {
  let component: MyReviewComponent;
  let fixture: ComponentFixture<MyReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyReviewComponent]
    });
    fixture = TestBed.createComponent(MyReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
