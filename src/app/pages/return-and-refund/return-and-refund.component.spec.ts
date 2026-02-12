import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnAndRefundComponent } from './return-and-refund.component';

describe('ReturnAndRefundComponent', () => {
  let component: ReturnAndRefundComponent;
  let fixture: ComponentFixture<ReturnAndRefundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnAndRefundComponent]
    });
    fixture = TestBed.createComponent(ReturnAndRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
