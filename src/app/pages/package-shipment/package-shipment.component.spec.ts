import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageShipmentComponent } from './package-shipment.component';

describe('PackageShipmentComponent', () => {
  let component: PackageShipmentComponent;
  let fixture: ComponentFixture<PackageShipmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackageShipmentComponent]
    });
    fixture = TestBed.createComponent(PackageShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
