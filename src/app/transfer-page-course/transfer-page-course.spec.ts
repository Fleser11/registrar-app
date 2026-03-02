import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferPageCourse } from './transfer-page-course';

describe('TransferPageCourse', () => {
  let component: TransferPageCourse;
  let fixture: ComponentFixture<TransferPageCourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferPageCourse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferPageCourse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
