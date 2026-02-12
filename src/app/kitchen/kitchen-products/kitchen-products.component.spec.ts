import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenProductsComponent } from './kitchen-products.component';

describe('KitchenProductsComponent', () => {
  let component: KitchenProductsComponent;
  let fixture: ComponentFixture<KitchenProductsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KitchenProductsComponent]
    });
    fixture = TestBed.createComponent(KitchenProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
