import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeEditorComponent } from './volume-editor-component';

describe('VolumeEditorComponent', () => {
  let component: VolumeEditorComponent;
  let fixture: ComponentFixture<VolumeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolumeEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolumeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
