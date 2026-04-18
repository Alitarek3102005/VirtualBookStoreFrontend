import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderManifestComponent } from './order-manifest-component';

describe('OrderManifestComponent', () => {
  let component: OrderManifestComponent;
  let fixture: ComponentFixture<OrderManifestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderManifestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderManifestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
