import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteLoginComponent } from './favorite-login.component';

describe('FavoriteLoginComponent', () => {
  let component: FavoriteLoginComponent;
  let fixture: ComponentFixture<FavoriteLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FavoriteLoginComponent]
    });
    fixture = TestBed.createComponent(FavoriteLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
