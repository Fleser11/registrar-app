import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAuditList } from './sub-audit-list';

describe('SubAuditList', () => {
  let component: SubAuditList;
  let fixture: ComponentFixture<SubAuditList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubAuditList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubAuditList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
