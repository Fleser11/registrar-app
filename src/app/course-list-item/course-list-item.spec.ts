import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseListItem } from './course-list-item';

describe('CourseListItem', () => {
  let component: CourseListItem;
  let fixture: ComponentFixture<CourseListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseListItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
