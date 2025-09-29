import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditSelector } from './audit-selector';

describe('AuditSelector', () => {
  let component: AuditSelector;
  let fixture: ComponentFixture<AuditSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
