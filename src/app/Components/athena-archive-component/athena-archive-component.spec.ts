import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AthenaArchiveComponent } from './athena-archive-component';

describe('AthenaArchiveComponent', () => {
  let component: AthenaArchiveComponent;
  let fixture: ComponentFixture<AthenaArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AthenaArchiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AthenaArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
