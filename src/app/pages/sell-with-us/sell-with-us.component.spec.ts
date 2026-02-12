import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellWithUsComponent } from './sell-with-us.component';

describe('SellWithUsComponent', () => {
  let component: SellWithUsComponent;
  let fixture: ComponentFixture<SellWithUsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SellWithUsComponent]
    });
    fixture = TestBed.createComponent(SellWithUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
