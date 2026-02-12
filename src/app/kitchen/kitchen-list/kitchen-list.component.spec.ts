import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenListComponent } from './kitchen-list.component';

describe('KitchenListComponent', () => {
  let component: KitchenListComponent;
  let fixture: ComponentFixture<KitchenListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KitchenListComponent]
    });
    fixture = TestBed.createComponent(KitchenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
